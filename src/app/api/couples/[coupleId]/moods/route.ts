import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember, resolveActorId } from "@/lib/api/guards";
import { moodCreateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));

    const moods = await prisma.moodCheckIn.findMany({
      where: { coupleId },
      include: { user: true },
      orderBy: { checkedAt: "desc" },
      take: 100
    });

    return ok(moods);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, moodCreateSchema);
    const userId = await resolveActorId(request, input.userId);
    await requireCoupleMember(coupleId, userId);

    const mood = await prisma.moodCheckIn.create({
      data: {
        coupleId,
        userId,
        mood: input.mood,
        energy: input.energy,
        stressLevel: input.stressLevel,
        carePreference: input.carePreference,
        note: input.note,
        checkedAt: input.checkedAt
      },
      include: { user: true }
    });

    return created(mood);
  } catch (error) {
    return handleApiError(error);
  }
}
