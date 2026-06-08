import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    enrollment: { findMany: vi.fn() },
    attendance: { findUnique: vi.fn(), upsert: vi.fn() },
    student: { findUnique: vi.fn(), update: vi.fn() },
    pricingConfig: { findFirst: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { saveAttendance, getSessionWithAttendance } from "@/app/admin/sessions/[id]/attendance/actions";
import { prisma } from "@/lib/prisma";

const mockFindSession = vi.mocked(prisma.session.findUnique);
const mockFindEnrollments = vi.mocked(prisma.enrollment.findMany);
const mockFindAttendance = vi.mocked(prisma.attendance.findUnique);
const mockUpsertAttendance = vi.mocked(prisma.attendance.upsert);
const mockFindStudent = vi.mocked(prisma.student.findUnique);
const mockUpdateStudent = vi.mocked(prisma.student.update);
const mockFindPricing = vi.mocked(prisma.pricingConfig.findFirst);

const PRICE = 1750;

describe("getSessionWithAttendance", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne null si la séance est introuvable", async () => {
    mockFindSession.mockResolvedValue(null);
    const result = await getSessionWithAttendance("session-inconnu");
    expect(result).toBeNull();
  });

  it("retourne la séance avec les inscriptions si trouvée", async () => {
    mockFindSession.mockResolvedValue({ id: "s-1", courseId: "c-1", startsAt: new Date(), attendances: [] } as any);
    mockFindEnrollments.mockResolvedValue([{ student: { id: "st-1" } }] as any);
    const result = await getSessionWithAttendance("s-1");
    expect(result).not.toBeNull();
    expect(result?.enrollments).toHaveLength(1);
  });
});

describe("saveAttendance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertAttendance.mockResolvedValue({} as any);
    mockFindPricing.mockResolvedValue({ perSessionCents: PRICE } as any);
  });

  it("crée une présence et incrémente le solde si nouvel étudiant PRESENT", async () => {
    mockFindAttendance.mockResolvedValue(null);
    mockFindStudent.mockResolvedValue({ balance: 0, paymentMode: "PER_SESSION" } as any);
    mockUpdateStudent.mockResolvedValue({} as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "PRESENT" }]);

    expect(mockUpsertAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: "PRESENT", amountCents: PRICE }),
      })
    );
    expect(mockUpdateStudent).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balance: { increment: PRICE } } })
    );
  });

  it("décrémente le solde du montant original si un étudiant passe de PRESENT à ABSENT", async () => {
    mockFindAttendance.mockResolvedValue({ status: "PRESENT", amountCents: PRICE } as any);
    mockFindStudent.mockResolvedValue({ balance: PRICE * 2, paymentMode: "PER_SESSION" } as any);
    mockUpdateStudent.mockResolvedValue({} as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "ABSENT" }]);

    expect(mockUpsertAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ amountCents: 0 }),
      })
    );
    expect(mockUpdateStudent).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balance: { decrement: PRICE } } })
    );
  });

  it("ne décrémente pas le solde si le solde est insuffisant (protection contre solde négatif)", async () => {
    mockFindAttendance.mockResolvedValue({ status: "PRESENT", amountCents: PRICE } as any);
    mockFindStudent.mockResolvedValue({ balance: 0, paymentMode: "PER_SESSION" } as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "ABSENT" }]);

    expect(mockUpdateStudent).not.toHaveBeenCalled();
  });

  it("ne modifie pas le solde si le statut ne change pas (ABSENT → ABSENT)", async () => {
    mockFindAttendance.mockResolvedValue({ status: "ABSENT", amountCents: 0 } as any);
    mockFindStudent.mockResolvedValue({ balance: 0, paymentMode: "PER_SESSION" } as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "ABSENT" }]);

    expect(mockUpdateStudent).not.toHaveBeenCalled();
  });

  it("ne modifie pas le solde pour un étudiant en paiement mensuel et stocke amountCents=0", async () => {
    mockFindAttendance.mockResolvedValue(null);
    mockFindStudent.mockResolvedValue({ balance: 0, paymentMode: "MONTHLY" } as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "PRESENT" }]);

    expect(mockUpdateStudent).not.toHaveBeenCalled();
    expect(mockFindPricing).not.toHaveBeenCalled();
    expect(mockUpsertAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ amountCents: 0 }),
      })
    );
  });

  it("utilise le prix par défaut (1750) si aucune configuration tarifaire n'est trouvée", async () => {
    mockFindAttendance.mockResolvedValue(null);
    mockFindStudent.mockResolvedValue({ balance: 0, paymentMode: "PER_SESSION" } as any);
    mockFindPricing.mockResolvedValue(null);
    mockUpdateStudent.mockResolvedValue({} as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "PRESENT" }]);

    expect(mockUpsertAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ amountCents: 1750 }),
      })
    );
    expect(mockUpdateStudent).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balance: { increment: 1750 } } })
    );
  });

  it("retourne success true après sauvegarde", async () => {
    mockFindAttendance.mockResolvedValue(null);
    mockFindStudent.mockResolvedValue({ balance: 0, paymentMode: "PER_SESSION" } as any);

    const result = await saveAttendance("s-1", [{ studentId: "st-1", status: "EXCUSED" }]);
    expect(result.success).toBe(true);
  });
});
