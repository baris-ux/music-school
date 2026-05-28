import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

import { resetPassword } from "@/app/reset-password/actions";
import { prisma } from "@/lib/prisma";

const mockFindFirst = vi.mocked(prisma.user.findFirst);
const mockUpdate = vi.mocked(prisma.user.update);

function makeFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

const prevState = { error: null, success: null };
const validPassword = "Motdepasse1!";

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne une erreur si le token est absent", async () => {
    const result = await resetPassword(
      prevState,
      makeFormData({ token: "", password: validPassword, confirm: validPassword })
    );
    expect(result.error).toBe("Token invalide.");
  });

  it("retourne une erreur si le mot de passe ne respecte pas les règles", async () => {
    const result = await resetPassword(
      prevState,
      makeFormData({ token: "abc", password: "faible", confirm: "faible" })
    );
    expect(result.error).toContain("8 caractères");
  });

  it("retourne une erreur si les mots de passe ne correspondent pas", async () => {
    const result = await resetPassword(
      prevState,
      makeFormData({ token: "abc", password: validPassword, confirm: "Autrechose1!" })
    );
    expect(result.error).toBe("Les mots de passe ne correspondent pas.");
  });

  it("retourne une erreur si le token est invalide ou expiré", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await resetPassword(
      prevState,
      makeFormData({ token: "token-invalide", password: validPassword, confirm: validPassword })
    );
    expect(result.error).toBe("Lien invalide ou expiré.");
  });

  it("met à jour le mot de passe et efface le token si tout est valide", async () => {
    mockFindFirst.mockResolvedValue({ id: "u-1" } as any);
    mockUpdate.mockResolvedValue({} as any);

    const result = await resetPassword(
      prevState,
      makeFormData({ token: "token-valide", password: validPassword, confirm: validPassword })
    );

    expect(result.error).toBeNull();
    expect(result.success).toBe("Mot de passe mis à jour ! Vous pouvez vous connecter.");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u-1" },
        data: expect.objectContaining({
          passwordHash: "hashed_password",
          resetToken: null,
          resetTokenExpiresAt: null,
        }),
      })
    );
  });
});
