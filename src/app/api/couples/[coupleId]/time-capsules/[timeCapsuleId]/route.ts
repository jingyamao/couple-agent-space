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
import {
  deleteWithUserSchema,
  timeCapsuleUpdateSchema
} from "@/lib/api/schemas";
import { hideLockedContent, canEditCapsule } from "@/lib/services/time-capsule";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    timeCapsuleId: string;
  }>;
};

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
    await requireCoupleMember(coupleId, await getRequesterId(request));
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
    await requireCoupleMember(coupleId, await resolveActorId(request, input.userId));
    const existing = await requireTimeCapsule(coupleId, timeCapsuleId);

    if (!canEditCapsule(existing)) {
      throw new ApiError(409, "TIME_CAPSULE_ALREADY_OPENED", "已开启的时间胶囊不能修改");
    }

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
    await requireCoupleMember(coupleId, await resolveActorId(request, input.userId));
    await requireTimeCapsule(coupleId, timeCapsuleId);
    await prisma.timeCapsule.delete({
      where: { id: timeCapsuleId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
