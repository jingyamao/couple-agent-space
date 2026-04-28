import { prisma } from "@/lib/prisma";
import { handleApiError, ok } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

function getDaysTogether(startedAt: Date | null) {
  if (!startedAt) return null;

  const diff = Date.now() - startedAt.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const userId = await getRequesterId(request);
    await requireCoupleMember(coupleId, userId);

    const [
      couple,
      anniversaries,
      moodCheckIns,
      diaryEntries,
      wishes,
      photos,
      timeCapsules
    ] = await Promise.all([
      prisma.couple.findUniqueOrThrow({
        where: { id: coupleId },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      }),
      prisma.anniversary.findMany({
        where: { coupleId },
        orderBy: { happenedAt: "asc" },
        take: 5
      }),
      prisma.moodCheckIn.findMany({
        where: { coupleId },
        include: { user: true },
        orderBy: { checkedAt: "desc" },
        take: 6
      }),
      prisma.diaryEntry.findMany({
        where: {
          coupleId,
          OR: [{ visibility: { not: "PRIVATE" } }, { authorId: userId }]
        },
        include: { author: true },
        orderBy: { happenedAt: "desc" },
        take: 5
      }),
      prisma.wish.findMany({
        where: { coupleId },
        orderBy: { updatedAt: "desc" },
        take: 10
      }),
      prisma.photo.findMany({
        where: { coupleId },
        orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
        take: 6
      }),
      prisma.timeCapsule.findMany({
        where: { coupleId },
        orderBy: { unlockAt: "asc" },
        take: 5
      })
    ]);

    const completedWishes = wishes.filter((wish) => wish.status === "DONE").length;

    return ok({
      couple: {
        ...couple,
        daysTogether: getDaysTogether(couple.startedAt)
      },
      anniversaries,
      moodCheckIns,
      diaryEntries,
      wishes: {
        items: wishes,
        progress:
          wishes.length === 0
            ? 0
            : Math.round((completedWishes / wishes.length) * 100)
      },
      photos,
      timeCapsules
    });
  } catch (error) {
    return handleApiError(error);
  }
}
