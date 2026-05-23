import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, noContent, ok } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{ coupleId: string; checkinId: string }>;
};

async function requireCheckIn(coupleId: string, checkinId: string) {
  const checkin = await prisma.checkIn.findFirst({ where: { id: checkinId, coupleId } });
  if (!checkin) throw new ApiError(404, "CHECKIN_NOT_FOUND", "打卡记录不存在");
  return checkin;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId, checkinId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));
    const checkin = await requireCheckIn(coupleId, checkinId);
    const full = await prisma.checkIn.findUnique({
      where: { id: checkin.id },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } }
    });
    return ok(full);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, checkinId } = await context.params;
    const userId = await getRequesterId(request);
    await requireCoupleMember(coupleId, userId);
    const checkin = await requireCheckIn(coupleId, checkinId);

    if (checkin.userId !== userId) {
      throw new ApiError(403, "CHECKIN_OWNER_REQUIRED", "只能删除自己的打卡记录");
    }

    await prisma.checkIn.delete({ where: { id: checkinId } });
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
