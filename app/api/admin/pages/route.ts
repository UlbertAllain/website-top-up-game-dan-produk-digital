import { requireAdminApiSession } from "@/features/auth/auth-session";
import { listContentPages } from "@/features/content/content.service";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminApiSession();

    const pages = await listContentPages();

    return successResponse({
      pages,
      total: pages.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
