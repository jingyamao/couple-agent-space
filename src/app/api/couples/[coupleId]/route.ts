import { prisma } from "@/lib/prisma";
import { handleApiError, noContent, ok, parseJson } from "@/lib/api/http";
import {
  getRequesterId,
  requireCoupleMember,
  requireCoupleOwner
} from "@/lib/api/guards";
import { coupleUpdateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, getRequesterId(request));

    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    return ok(couple);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, coupleUpdateSchema);
    await requireCoupleMember(coupleId, input.userId ?? getRequesterId(request));

    const couple = await prisma.couple.update({
      where: { id: coupleId },
      data: {
        title: input.title,
        startedAt: input.startedAt
      }
    });

    return ok(couple);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleOwner(coupleId, getRequesterId(request));
    await prisma.couple.delete({
      where: { id: coupleId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
