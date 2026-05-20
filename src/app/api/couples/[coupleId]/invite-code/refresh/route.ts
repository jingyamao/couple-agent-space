import { prisma } from "@/lib/prisma";
import { handleApiError, ok } from "@/lib/api/http";
import { getRequesterId, requireCoupleOwner } from "@/lib/api/guards";
import { createUniqueInviteCode } from "@/lib/api/invite-code";

type RouteContext = {
  params: Promise<{ coupleId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleOwner(coupleId, await getRequesterId(request));

    const { code, expiresAt } = await createUniqueInviteCode();

    const couple = await prisma.couple.update({
      where: { id: coupleId },
      data: {
        inviteCode: code,
        inviteCodeExpiresAt: expiresAt,
        inviteCodeCreatedAt: new Date()
      }
    });

    return ok({
      inviteCode: couple.inviteCode,
      expiresAt
    });
  } catch (error) {
    return handleApiError(error);
  }
}
