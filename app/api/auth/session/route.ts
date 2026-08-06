import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { createSessionSchema } from "@/features/auth/auth.schema";
import {
  createAdminSessionCookie,
  getSessionCookieOptions,
  revokeAdminSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/features/auth/auth.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    const body = await readJson(request);

    const { idToken } = createSessionSchema.parse(body);

    const sessionCookie = await createAdminSessionCookie(idToken);

    const cookieStore = await cookies();

    cookieStore.set(
      SESSION_COOKIE_NAME,
      sessionCookie,
      getSessionCookieOptions(),
    );

    return successResponse({
      authenticated: true,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request);

    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      await revokeAdminSessionCookie(sessionCookie);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);

    return successResponse({
      authenticated: false,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
