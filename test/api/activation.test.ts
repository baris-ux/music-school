import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { activerCompte } from "@/app/activation/actions";
import { prisma } from "@/lib/prisma";

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);

function makeFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

const validPassword = "Motdepasse1!";

describe("activerCompte", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lance une erreur si les champs sont manquants", async () => {
    await expect(
      activerCompte(makeFormData({ token: "", password: "", confirm: "" }))
    ).rejects.toThrow("Champs obligatoires manquants");
  });

  it("lance une erreur si les mots de passe ne correspondent pas", async () => {
    await expect(
      activerCompte(makeFormData({ token: "abc", password: validPassword, confirm: "Autrechose1!" }))
    ).rejects.toThrow("Les mots de passe ne correspondent pas");
  });

  it("lance une erreur si le mot de passe ne respecte pas les règles", async () => {
    await expect(
      activerCompte(makeFormData({ token: "abc", password: "faible", confirm: "faible" }))
    ).rejects.toThrow("12 caractères");
  });

  it("lance une erreur si le token est invalide", async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(
      activerCompte(makeFormData({ token: "invalide", password: validPassword, confirm: validPassword }))
    ).rejects.toThrow("Lien invalide");
  });

  it("lance une erreur si le token est expiré", async () => {
    mockFindUnique.mockResolvedValue({
      id: "u-1",
      tokenExpiresAt: new Date(Date.now() - 1000),
    } as any);
    await expect(
      activerCompte(makeFormData({ token: "expiré", password: validPassword, confirm: validPassword }))
    ).rejects.toThrow("Lien expiré");
  });

  it("active le compte et redirige vers /login si tout est valide", async () => {
    mockFindUnique.mockResolvedValue({
      id: "u-1",
      tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    } as any);
    mockUpdate.mockResolvedValue({} as any);

    await expect(
      activerCompte(makeFormData({ token: "valide", password: validPassword, confirm: validPassword }))
    ).rejects.toThrow("REDIRECT:/login");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u-1" },
        data: expect.objectContaining({
          passwordHash: "hashed_password",
          isActive: true,
          invitationToken: null,
          tokenExpiresAt: null,
        }),
      })
    );
  });
});
