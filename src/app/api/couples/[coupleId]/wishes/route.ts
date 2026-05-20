import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember, resolveActorId } from "@/lib/api/guards";
import { wishCreateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));

    const statusParam = new URL(request.url).searchParams.get("status");
    const validStatuses = ["IDEA", "PLANNED", "DONE", "PAUSED"] as const;
    const statusFilter = validStatuses.includes(statusParam as (typeof validStatuses[number]))
      ? (statusParam as (typeof validStatuses[number]))
      : undefined;

    const wishes = await prisma.wish.findMany({
      where: {
        coupleId,
        ...(statusFilter ? { status: statusFilter } : {})
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
    const creatorId = await resolveActorId(request, input.creatorId);
    await requireCoupleMember(coupleId, creatorId);

    const wish = await prisma.wish.create({
      data: {
        coupleId,
        creatorId,
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
