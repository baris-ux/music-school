import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendResetPasswordEmail: vi.fn(),
}));

import { requestPasswordReset } from "@/app/forgot-password/actions";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/email";

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);
const mockSendEmail = vi.mocked(sendResetPasswordEmail);

function makeFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

const prevState = { error: null, success: null };

describe("requestPasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne une erreur si l'email est absent", async () => {
    const result = await requestPasswordReset(prevState, makeFormData({ email: "" }));
    expect(result.error).toBe("Email obligatoire.");
    expect(result.success).toBeNull();
  });

  it("retourne un message générique si l'email n'existe pas (sécurité)", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await requestPasswordReset(prevState, makeFormData({ email: "inconnu@test.com" }));
    expect(result.error).toBeNull();
    expect(result.success).toBe("Si un compte existe, un email a été envoyé.");
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("enregistre le token et envoie l'email si l'utilisateur existe", async () => {
    mockFindUnique.mockResolvedValue({ id: "u-1", email: "user@test.com" } as any);
    mockUpdate.mockResolvedValue({} as any);
    mockSendEmail.mockResolvedValue(undefined);

    const result = await requestPasswordReset(prevState, makeFormData({ email: "user@test.com" }));

    expect(result.error).toBeNull();
    expect(result.success).toBe("Si un compte existe, un email a été envoyé.");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "user@test.com" },
        data: expect.objectContaining({
          resetToken: expect.any(String),
          resetTokenExpiresAt: expect.any(Date),
        }),
      })
    );
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "user@test.com", token: expect.any(String) })
    );
  });

  it("retourne 500 en cas d'erreur inattendue", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB crash"));
    await expect(
      requestPasswordReset(prevState, makeFormData({ email: "user@test.com" }))
    ).rejects.toThrow("DB crash");
  });
});
