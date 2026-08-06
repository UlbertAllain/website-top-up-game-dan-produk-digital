import "server-only";

import { adminAuth } from "@/lib/firebase/admin";
import { AppError } from "@/lib/app-error";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME?.trim() || "__session";

const rawSessionMaxAgeDays = Number(
  process.env.SESSION_COOKIE_MAX_AGE_DAYS ?? "3",
);

if (
  !Number.isInteger(rawSessionMaxAgeDays) ||
  rawSessionMaxAgeDays < 1 ||
  rawSessionMaxAgeDays > 14
) {
  throw new Error(
    "SESSION_COOKIE_MAX_AGE_DAYS harus berupa bilangan bulat antara 1 sampai 14.",
  );
}

const SESSION_MAX_AGE_DAYS = rawSessionMaxAgeDays;

export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

const SESSION_MAX_AGE_MILLISECONDS = SESSION_MAX_AGE_SECONDS * 1000;

const MAX_LOGIN_AGE_SECONDS = 5 * 60;

const MAX_CLOCK_SKEW_SECONDS = 60;

export type AdminSession = {
  uid: string;
  email: string | null;
};

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: "high" as const,
  };
}

export async function createAdminSessionCookie(
  idToken: string,
): Promise<string> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    if (decodedToken.admin !== true) {
      throw new AppError(
        "Akun ini tidak memiliki akses admin.",
        "ADMIN_ACCESS_REQUIRED",
        403,
      );
    }

    const currentTime = Math.floor(Date.now() / 1000);

    const authenticationTime = decodedToken.auth_time;

    if (typeof authenticationTime !== "number") {
      throw new AppError(
        "Informasi waktu login tidak valid.",
        "INVALID_AUTHENTICATION_TIME",
        401,
      );
    }

    const loginAge = currentTime - authenticationTime;

    if (loginAge > MAX_LOGIN_AGE_SECONDS) {
      throw new AppError(
        "Proses login sudah kedaluwarsa. Silakan login kembali.",
        "RECENT_LOGIN_REQUIRED",
        401,
      );
    }

    if (loginAge < -MAX_CLOCK_SKEW_SECONDS) {
      throw new AppError(
        "Waktu autentikasi tidak valid.",
        "INVALID_AUTHENTICATION_TIME",
        401,
      );
    }

    return await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MILLISECONDS,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error("[CREATE_ADMIN_SESSION_ERROR]", error);

    throw new AppError(
      "Proses autentikasi gagal. Silakan login kembali.",
      "AUTHENTICATION_FAILED",
      401,
    );
  }
}

export async function verifyAdminSessionCookie(
  sessionCookie: string,
): Promise<AdminSession> {
  try {
    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    if (decodedToken.admin !== true) {
      throw new AppError(
        "Anda tidak memiliki akses admin.",
        "ADMIN_ACCESS_REQUIRED",
        403,
      );
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Sesi admin tidak valid atau telah berakhir.",
      "INVALID_ADMIN_SESSION",
      401,
    );
  }
}

export async function revokeAdminSessionCookie(
  sessionCookie: string,
): Promise<void> {
  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);

    await adminAuth.revokeRefreshTokens(decodedToken.uid);
  } catch (error) {
    console.warn(
      "[REVOKE_ADMIN_SESSION_WARNING]",
      error instanceof Error ? error.message : "Sesi tidak dapat diverifikasi.",
    );
  }
}
