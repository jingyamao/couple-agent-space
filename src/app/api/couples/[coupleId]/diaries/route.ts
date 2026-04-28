import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";
import { diaryCreateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const userId = getRequesterId(request);
    await requireCoupleMember(coupleId, userId);

    const diaryEntries = await prisma.diaryEntry.findMany({
      where: {
        coupleId,
        OR: [{ visibility: { not: "PRIVATE" } }, { authorId: userId }]
      },
      include: { author: true },
      orderBy: { happenedAt: "desc" },
      take: 100
    });

    return ok(diaryEntries);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, diaryCreateSchema);
    await requireCoupleMember(coupleId, input.authorId);

    const diary = await prisma.diaryEntry.create({
      data: {
        coupleId,
        authorId: input.authorId,
        title: input.title,
        content: input.content,
        visibility: input.visibility,
        happenedAt: input.happenedAt
      },
      include: { author: true }
    });

    return created(diary);
  } catch (error) {
    return handleApiError(error);
  }
}
