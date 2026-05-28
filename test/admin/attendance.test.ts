import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    enrollment: { findMany: vi.fn() },
    attendance: { findUnique: vi.fn(), upsert: vi.fn() },
    student: { update: vi.fn() },
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
const mockUpdateStudent = vi.mocked(prisma.student.update);

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
  beforeEach(() => vi.clearAllMocks());

  it("crée une présence et incrémente le solde si nouvel étudiant PRESENT", async () => {
    mockFindAttendance.mockResolvedValue(null);
    mockUpsertAttendance.mockResolvedValue({} as any);
    mockUpdateStudent.mockResolvedValue({} as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "PRESENT" }]);

    expect(mockUpsertAttendance).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ status: "PRESENT" }) })
    );
    expect(mockUpdateStudent).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balance: { increment: 1000 } } })
    );
  });

  it("décrémente le solde si un étudiant passe de PRESENT à ABSENT", async () => {
    mockFindAttendance.mockResolvedValue({ status: "PRESENT" } as any);
    mockUpsertAttendance.mockResolvedValue({} as any);
    mockUpdateStudent.mockResolvedValue({} as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "ABSENT" }]);

    expect(mockUpdateStudent).toHaveBeenCalledWith(
      expect.objectContaining({ data: { balance: { decrement: 1000 } } })
    );
  });

  it("ne modifie pas le solde si le statut ne change pas (ABSENT → ABSENT)", async () => {
    mockFindAttendance.mockResolvedValue({ status: "ABSENT" } as any);
    mockUpsertAttendance.mockResolvedValue({} as any);

    await saveAttendance("s-1", [{ studentId: "st-1", status: "ABSENT" }]);

    expect(mockUpdateStudent).not.toHaveBeenCalled();
  });

  it("retourne success true après sauvegarde", async () => {
    mockFindAttendance.mockResolvedValue(null);
    mockUpsertAttendance.mockResolvedValue({} as any);

    const result = await saveAttendance("s-1", [{ studentId: "st-1", status: "EXCUSED" }]);
    expect(result.success).toBe(true);
  });
});
