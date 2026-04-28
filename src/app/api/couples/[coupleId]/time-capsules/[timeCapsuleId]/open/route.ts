import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, ok } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    timeCapsuleId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId, timeCapsuleId } = await context.params;
    await requireCoupleMember(coupleId, getRequesterId(request));

    const capsule = await prisma.timeCapsule.findFirst({
      where: { id: timeCapsuleId, coupleId }
    });

    if (!capsule) {
      throw new ApiError(404, "TIME_CAPSULE_NOT_FOUND", "时间胶囊不存在");
    }

    if (capsule.unlockAt.getTime() > Date.now()) {
      throw new ApiError(409, "TIME_CAPSULE_LOCKED", "时间胶囊还没到开启时间");
    }

    const opened = await prisma.timeCapsule.update({
      where: { id: timeCapsuleId },
      data: {
        status: "OPENED",
        openedAt: new Date()
      }
    });

    return ok(opened);
  } catch (error) {
    return handleApiError(error);
  }
}
