import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  createProduct,
  listProducts,
} from "@/features/products/product.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminApiSession();

    const searchParams = request.nextUrl.searchParams;

    const products = await listProducts({
      categoryId: searchParams.get("categoryId") ?? undefined,

      type: searchParams.get("type") ?? undefined,

      publicationStatus: searchParams.get("publicationStatus") ?? undefined,

      stockStatus: searchParams.get("stockStatus") ?? undefined,

      isFeatured: searchParams.get("isFeatured") ?? undefined,

      search: searchParams.get("search") ?? undefined,
    });

    return successResponse({
      products,
      total: products.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const body = await readJson(request);

    const product = await createProduct(body);

    return successResponse(
      {
        product,
      },
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
