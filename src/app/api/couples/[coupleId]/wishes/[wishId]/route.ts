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

    const wish = await prisma.wish.findFirst({
      where: { id: wishId, coupleId },
      include: { creator: true }
    });

    if (!wish) {
      throw new ApiError(404, "WISH_NOT_FOUND", "愿望不存在");
    }

    return ok(wish);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, wishId } = await context.params;
    const input = await parseOptionalJson(request, wishUpdateSchema, {});
    const userId = await resolveActorId(request, input.userId);
    await requireCoupleMember(coupleId, userId);
    const existing = await requireWish(coupleId, wishId);

    if (input.status && input.status !== existing.status) {
      await prisma.wishStatusHistory.create({
        data: {
          wishId,
          fromStatus: existing.status,
          toStatus: input.status,
          changedBy: userId
        }
      });
    }

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
    const userId = await resolveActorId(request, input.userId);
    await requireCoupleMember(coupleId, userId);
    const wish = await requireWish(coupleId, wishId);

    if (wish.creatorId !== userId) {
      throw new ApiError(403, "WISH_CREATOR_REQUIRED", "只有创建者可以删除愿望");
    }
    await prisma.wish.delete({
      where: { id: wishId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
