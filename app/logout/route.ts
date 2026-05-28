import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionUser } from "@/lib/session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const session = await getIronSession<{ user?: SessionUser }>(response.cookies, sessionOptions);
  session.destroy();
  return response;
}
