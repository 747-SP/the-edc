import { cookies } from "next/headers";
import type { Session } from "@/types";

const SESSION_COOKIE = "edc-session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const data = cookieStore.get(SESSION_COOKIE);
  if (!data?.value) return null;

  try {
    return JSON.parse(data.value) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
