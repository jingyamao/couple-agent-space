import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";
import { timeCapsuleCreateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
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

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, getRequesterId(request));

    const capsules = await prisma.timeCapsule.findMany({
      where: { coupleId },
      orderBy: { unlockAt: "asc" },
      take: 100
    });

    return ok(capsules.map(hideLockedContent));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, timeCapsuleCreateSchema);
    await requireCoupleMember(coupleId, input.userId);

    const capsule = await prisma.timeCapsule.create({
      data: {
        coupleId,
        title: input.title,
        content: input.content,
        unlockAt: input.unlockAt
      }
    });

    return created(hideLockedContent(capsule));
  } catch (error) {
    return handleApiError(error);
  }
}
