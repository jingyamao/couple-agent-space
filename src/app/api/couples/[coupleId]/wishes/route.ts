import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";
import { wishCreateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, getRequesterId(request));

    const status = new URL(request.url).searchParams.get("status") ?? undefined;
    const wishes = await prisma.wish.findMany({
      where: {
        coupleId,
        status: status as never
      },
      include: { creator: true },
      orderBy: { updatedAt: "desc" },
      take: 100
    });

    return ok(wishes);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, wishCreateSchema);
    await requireCoupleMember(coupleId, input.creatorId);

    const wish = await prisma.wish.create({
      data: {
        coupleId,
        creatorId: input.creatorId,
        title: input.title,
        category: input.category,
        status: input.status,
        targetAt: input.targetAt,
        budgetCents: input.budgetCents,
        note: input.note
      },
      include: { creator: true }
    });

    return created(wish);
  } catch (error) {
    return handleApiError(error);
  }
}
