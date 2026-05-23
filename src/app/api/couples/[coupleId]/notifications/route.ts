import { prisma } from "@/lib/prisma";
import { handleApiError, ok, noContent } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{ coupleId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const userId = await getRequesterId(request);
    await requireCoupleMember(coupleId, userId);

    const notifications = await prisma.notification.findMany({
      where: {
        coupleId,
        OR: [{ userId }, { userId: null }]
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return ok(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const userId = await getRequesterId(request);
    await requireCoupleMember(coupleId, userId);

    await prisma.notification.updateMany({
      where: {
        coupleId,
        OR: [{ userId }, { userId: null }],
        readAt: null
      },
      data: { readAt: new Date() }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
