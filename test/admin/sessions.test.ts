import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findUnique: vi.fn() },
    session: { create: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createSession, deleteSession } from "@/app/admin/sessions/actions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const mockGetSession = vi.mocked(getSession);
const mockFindCourse = vi.mocked(prisma.course.findUnique);
const mockCreateSession = vi.mocked(prisma.session.create);
const mockDeleteSession = vi.mocked(prisma.session.delete);

const adminSession = { userId: "u-1", role: "ADMIN" as const, email: "admin@test.com" };
const prevState = {};

function makeFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

const validFields = {
  courseId: "course-1",
  date: "2026-06-01",
  startTime: "09:00",
  endTime: "10:00",
};

describe("createSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une erreur si non connecté", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await createSession(prevState, makeFormData(validFields));
    expect(result.error).toBe("Vous devez être connecté.");
  });

  it("retourne une erreur si le rôle n'est pas ADMIN", async () => {
    mockGetSession.mockResolvedValue({ ...adminSession, role: "STUDENT" });
    const result = await createSession(prevState, makeFormData(validFields));
    expect(result.error).toBe("Accès refusé.");
  });

  it("retourne une erreur si des champs sont manquants", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    const result = await createSession(prevState, makeFormData({ courseId: "", date: "", startTime: "", endTime: "" }));
    expect(result.error).toBe("Tous les champs sont obligatoires.");
  });

  it("retourne une erreur si l'heure de fin est avant l'heure de début", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    const result = await createSession(prevState, makeFormData({ ...validFields, startTime: "10:00", endTime: "09:00" }));
    expect(result.error).toBe("L'heure de fin doit être après l'heure de début.");
  });

  it("retourne une erreur si le cours est introuvable", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockFindCourse.mockResolvedValue(null);
    const result = await createSession(prevState, makeFormData(validFields));
    expect(result.error).toBe("Cours introuvable.");
  });

  it("crée la séance si tout est valide", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockFindCourse.mockResolvedValue({ id: "course-1" } as any);
    mockCreateSession.mockResolvedValue({} as any);
    const result = await createSession(prevState, makeFormData(validFields));
    expect(result.success).toBe("La séance a bien été créée.");
    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ courseId: "course-1", hours: 1 }),
      })
    );
  });
});

describe("deleteSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lance une erreur si non connecté", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(deleteSession(makeFormData({ id: "s-1" }))).rejects.toThrow("Accès refusé.");
  });

  it("lance une erreur si l'id est manquant", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    await expect(deleteSession(makeFormData({ id: "" }))).rejects.toThrow("Identifiant manquant.");
  });

  it("supprime la séance si tout est valide", async () => {
    mockGetSession.mockResolvedValue(adminSession);
    mockDeleteSession.mockResolvedValue({} as any);
    await deleteSession(makeFormData({ id: "s-1" }));
    expect(mockDeleteSession).toHaveBeenCalledWith({ where: { id: "s-1" } });
  });
});
