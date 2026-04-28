import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  noContent,
  ok,
  parseOptionalJson
} from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";
import {
  anniversaryUpdateSchema,
  deleteWithUserSchema
} from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    anniversaryId: string;
  }>;
};

async function requireAnniversary(coupleId: string, anniversaryId: string) {
  const anniversary = await prisma.anniversary.findFirst({
    where: { id: anniversaryId, coupleId }
  });

  if (!anniversary) {
    throw new ApiError(404, "ANNIVERSARY_NOT_FOUND", "纪念日不存在");
  }

  return anniversary;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId, anniversaryId } = await context.params;
    await requireCoupleMember(coupleId, getRequesterId(request));
    const anniversary = await requireAnniversary(coupleId, anniversaryId);

    return ok(anniversary);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, anniversaryId } = await context.params;
    const input = await parseOptionalJson(request, anniversaryUpdateSchema, {});
    await requireCoupleMember(coupleId, input.userId ?? getRequesterId(request));
    await requireAnniversary(coupleId, anniversaryId);

    const anniversary = await prisma.anniversary.update({
      where: { id: anniversaryId },
      data: {
        title: input.title,
        happenedAt: input.happenedAt,
        remindDays: input.remindDays,
        note: input.note
      }
    });

    return ok(anniversary);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, anniversaryId } = await context.params;
    const input = await parseOptionalJson(request, deleteWithUserSchema, {});
    await requireCoupleMember(coupleId, input.userId ?? getRequesterId(request));
    await requireAnniversary(coupleId, anniversaryId);
    await prisma.anniversary.delete({
      where: { id: anniversaryId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
