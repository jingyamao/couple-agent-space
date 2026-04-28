import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  noContent,
  ok,
  parseOptionalJson
} from "@/lib/api/http";
import {
  getRequesterId,
  requireCoupleMember,
  resolveActorId
} from "@/lib/api/guards";
import { deleteWithUserSchema, wishUpdateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    wishId: string;
  }>;
};

async function requireWish(coupleId: string, wishId: string) {
  const wish = await prisma.wish.findFirst({
    where: { id: wishId, coupleId }
  });

  if (!wish) {
    throw new ApiError(404, "WISH_NOT_FOUND", "愿望不存在");
  }

  return wish;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId, wishId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));
    await requireWish(coupleId, wishId);

    const wish = await prisma.wish.findUnique({
      where: { id: wishId },
      include: { creator: true }
    });

    return ok(wish);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, wishId } = await context.params;
    const input = await parseOptionalJson(request, wishUpdateSchema, {});
    await requireCoupleMember(coupleId, await resolveActorId(request, input.userId));
    await requireWish(coupleId, wishId);

    const wish = await prisma.wish.update({
      where: { id: wishId },
      data: {
        title: input.title,
        category: input.category,
        status: input.status,
        targetAt: input.targetAt,
        budgetCents: input.budgetCents,
        note: input.note
      },
      include: { creator: true }
    });

    return ok(wish);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, wishId } = await context.params;
    const input = await parseOptionalJson(request, deleteWithUserSchema, {});
    await requireCoupleMember(coupleId, await resolveActorId(request, input.userId));
    await requireWish(coupleId, wishId);
    await prisma.wish.delete({
      where: { id: wishId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
