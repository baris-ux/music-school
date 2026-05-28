import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser = {
  userId: string;
  role: "ADMIN" | "STUDENT";
  email: string;
};

type SessionData = {
  user?: SessionUser;
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "session_v3",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(): Promise<SessionUser | null> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session.user ?? null;
}

export async function clearSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.destroy();
}
