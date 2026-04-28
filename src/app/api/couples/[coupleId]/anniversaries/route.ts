import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember, resolveActorId } from "@/lib/api/guards";
import { anniversaryCreateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));

    const anniversaries = await prisma.anniversary.findMany({
      where: { coupleId },
      orderBy: { happenedAt: "asc" }
    });

    return ok(anniversaries);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, anniversaryCreateSchema);
    await requireCoupleMember(coupleId, await resolveActorId(request, input.userId));

    const anniversary = await prisma.anniversary.create({
      data: {
        coupleId,
        title: input.title,
        happenedAt: input.happenedAt,
        remindDays: input.remindDays,
        note: input.note
      }
    });

    return created(anniversary);
  } catch (error) {
    return handleApiError(error);
  }
}
