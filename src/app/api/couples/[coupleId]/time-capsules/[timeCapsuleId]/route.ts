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
  deleteWithUserSchema,
  timeCapsuleUpdateSchema
} from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    timeCapsuleId: string;
  }>;
};

function hideLockedContent<T extends { unlockAt: Date; status: string; content: string }>(
  item: T
) {
  if (item.status === "LOCKED" && item.unlockAt.getTime() > Date.now()) {
    return {
      ...item,
      content: null
    };
  }

  return item;
}

async function requireTimeCapsule(coupleId: string, timeCapsuleId: string) {
  const capsule = await prisma.timeCapsule.findFirst({
    where: { id: timeCapsuleId, coupleId }
  });

  if (!capsule) {
    throw new ApiError(404, "TIME_CAPSULE_NOT_FOUND", "时间胶囊不存在");
  }

  return capsule;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId, timeCapsuleId } = await context.params;
    await requireCoupleMember(coupleId, getRequesterId(request));
    const capsule = await requireTimeCapsule(coupleId, timeCapsuleId);

    return ok(hideLockedContent(capsule));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, timeCapsuleId } = await context.params;
    const input = await parseOptionalJson(request, timeCapsuleUpdateSchema, {});
    await requireCoupleMember(coupleId, input.userId ?? getRequesterId(request));
    await requireTimeCapsule(coupleId, timeCapsuleId);

    const capsule = await prisma.timeCapsule.update({
      where: { id: timeCapsuleId },
      data: {
        title: input.title,
        content: input.content,
        unlockAt: input.unlockAt
      }
    });

    return ok(hideLockedContent(capsule));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, timeCapsuleId } = await context.params;
    const input = await parseOptionalJson(request, deleteWithUserSchema, {});
    await requireCoupleMember(coupleId, input.userId ?? getRequesterId(request));
    await requireTimeCapsule(coupleId, timeCapsuleId);
    await prisma.timeCapsule.delete({
      where: { id: timeCapsuleId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
