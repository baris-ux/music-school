import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inscriptionRequest: { findUnique: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendInvitationEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { accepterInscription, refuserInscription } from "@/app/admin/inscriptions/actions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendInvitationEmail } from "@/lib/email";

const mockGetSession = vi.mocked(getSession);
const mockFindDemande = vi.mocked(prisma.inscriptionRequest.findUnique);
const mockFindUser = vi.mocked(prisma.user.findUnique);
const mockTransaction = vi.mocked(prisma.$transaction);
const mockUpdateDemande = vi.mocked(prisma.inscriptionRequest.update);
const mockSendEmail = vi.mocked(sendInvitationEmail);

const adminSession = { userId: "u-1", role: "ADMIN" as const, email: "admin@test.com" };

const mockDemande = {
  id: "d-1",
  email: "etudiant@test.com",
  firstName: "Jean",
  lastName: "Dupont",
  phoneNumber: "0123456789",
};

function makeFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

describe("accepterInscription", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirige vers /login si non connecté", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(accepterInscription(makeFormData({ id: "d-1" }))).rejects.toThrow("REDIRECT:/login");
  });

  it("lance une erreur si la demande est introuvable", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockFindDemande.mockResolvedValue(null);
    await expect(accepterInscription(makeFormData({ id: "d-1" }))).rejects.toThrow("Demande introuvable");
  });

  it("lance une erreur si un compte existe déjà pour cet email", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockFindDemande.mockResolvedValue(mockDemande as any);
    mockFindUser.mockResolvedValue({ id: "u-existing" } as any);
    await expect(accepterInscription(makeFormData({ id: "d-1" }))).rejects.toThrow("Un compte existe déjà");
  });

  it("exécute la transaction et envoie l'email si valide", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockFindDemande.mockResolvedValue(mockDemande as any);
    mockFindUser.mockResolvedValue(null);
    mockTransaction.mockResolvedValue([{}, {}] as any);
    mockSendEmail.mockResolvedValue(undefined);

    await accepterInscription(makeFormData({ id: "d-1" }));

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "etudiant@test.com" })
    );
  });

  it("ne lance pas d'erreur si l'email échoue (le compte reste créé)", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockFindDemande.mockResolvedValue(mockDemande as any);
    mockFindUser.mockResolvedValue(null);
    mockTransaction.mockResolvedValue([{}, {}] as any);
    mockSendEmail.mockRejectedValue(new Error("Resend timeout"));

    await expect(accepterInscription(makeFormData({ id: "d-1" }))).resolves.not.toThrow();
    expect(mockTransaction).toHaveBeenCalled();
  });
});

describe("refuserInscription", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirige vers /login si non connecté", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(refuserInscription(makeFormData({ id: "d-1" }))).rejects.toThrow("REDIRECT:/login");
  });

  it("met à jour le statut à REJECTED", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockUpdateDemande.mockResolvedValue({} as any);

    await refuserInscription(makeFormData({ id: "d-1" }));

    expect(mockUpdateDemande).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "REJECTED" } })
    );
  });
});
