import { NextRequest } from "next/server";

import { requireAdminApiSession } from "@/features/auth/auth-session";
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/features/products/product.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { assertSameOrigin, readJson } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: ProductRouteContext) {
  try {
    await requireAdminApiSession();

    const { id } = await context.params;

    const product = await getProduct(id);

    return successResponse({
      product,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: ProductRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;
    const body = await readJson(request);

    const product = await updateProduct(id, body);

    return successResponse({
      product,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: ProductRouteContext,
) {
  try {
    assertSameOrigin(request);

    await requireAdminApiSession();

    const { id } = await context.params;

    await deleteProduct(id);

    return successResponse({
      deleted: true,
      productId: id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
