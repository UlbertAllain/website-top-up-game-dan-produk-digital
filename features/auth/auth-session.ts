import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SESSION_COOKIE_NAME,
  verifyAdminSessionCookie,
} from "@/features/auth/auth.service";
import { AppError } from "@/lib/app-error";

export async function getAdminSession() {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return await verifyAdminSessionCookie(sessionCookie);
  } catch {
    return null;
  }
}

export async function requireAdminPageSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminApiSession() {
  const session = await getAdminSession();

  if (!session) {
    throw new AppError("Anda harus login sebagai admin.", "UNAUTHORIZED", 401);
  }

  return session;
}
