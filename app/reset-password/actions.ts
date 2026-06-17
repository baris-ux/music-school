"use server";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

export type ResetState = {
  error: string | null;
  success: string | null;
};

export async function resetPassword(
  prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { error: "Token invalide.", success: null };
  if (password !== confirm) return { error: "Les mots de passe ne correspondent pas.", success: null };

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gte: new Date() },
    },
  });

  if (!user) return { error: "Lien invalide ou expiré.", success: null };

  const minLength = user.role === "ADMIN" ? 16 : 12;
  const passwordRegex = new RegExp(`^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*\\-_]).{${minLength},}$`);
  if (!passwordRegex.test(password)) {
    return {
      error: `Le mot de passe doit contenir au moins ${minLength} caractères, une majuscule, un chiffre et un caractère spécial (!@#$%^&*-_)`,
      success: null,
    };
  }

  const passwordHash = await argon2.hash(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return { error: null, success: "Mot de passe mis à jour ! Vous pouvez vous connecter." };
}