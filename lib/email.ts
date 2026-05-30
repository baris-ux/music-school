import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendInvitationEmail({
  to,
  firstName,
  token,
}: {
  to: string;
  firstName: string;
  token: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY manquant — email non envoyé");
    return;
  }

  const lien = `${process.env.NEXT_PUBLIC_APP_URL}/activation?token=${token}`;

  const result = await resend.emails.send({
    from: "Académie de Musique <onboarding@resend.dev>",
    to,
    subject: "Bienvenue — Activez votre compte",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Bonjour ${firstName},</h2>
        <p>Votre demande d'inscription à l'Académie de Musique a été acceptée.</p>
        <p>Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder à votre espace étudiant :</p>
        <a href="${lien}" style="display:inline-block;margin-top:16px;background:#0f172a;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;">
          Activer mon compte
        </a>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
          Ce lien expire dans 48 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        </p>
      </div>
    `,
  });

  void result;
}

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY manquant — email non envoyé");
    return;
  }

  await resend.emails.send({
    from: "Académie de Musique <onboarding@resend.dev>",
    to: "vedatbayer06@hotmail.com",
    subject: `Nouveau message de ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Message :</strong></p>
        <p style="background:#f8f8f8;padding:12px;border-radius:8px;">${escapeHtml(message)}</p>
      </div>
    `,
  });
}


export async function sendResetPasswordEmail({
  to,
  token,
}: {
  to: string;
  token: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY manquant — email non envoyé");
    return;
  }

  const lien = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Académie de Musique <onboarding@resend.dev>",
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
        <a href="${lien}" style="display:inline-block;margin-top:16px;background:#0f172a;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;">
          Réinitialiser mon mot de passe
        </a>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
          Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        </p>
      </div>
    `,
  });
}