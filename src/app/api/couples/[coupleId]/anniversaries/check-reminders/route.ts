import { differenceInDays, addYears } from "date-fns";
import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{ coupleId: string }>;
};

function getNextOccurrence(happenedAt: Date): Date {
  const now = new Date();
  let next = new Date(now.getFullYear(), happenedAt.getMonth(), happenedAt.getDate());
  if (next.getTime() < now.getTime()) next = addYears(next, 1);
  return next;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const userId = await getRequesterId(request);
    await requireCoupleMember(coupleId, userId);

    const anniversaries = await prisma.anniversary.findMany({
      where: { coupleId }
    });

    const newNotifications = [];

    for (const a of anniversaries) {
      const nextDate = getNextOccurrence(a.happenedAt);
      const daysUntil = differenceInDays(nextDate, new Date());

      if (daysUntil < 0) continue;

      const matchingRemindDay = a.remindDays.find((d) => d === daysUntil);
      if (!matchingRemindDay) continue;

      const existing = await prisma.notification.findFirst({
        where: {
          coupleId,
          type: "ANNIVERSARY_REMINDER",
          data: {
            path: ["anniversaryId"],
            equals: a.id
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existing) continue;

      const notification = await prisma.notification.create({
        data: {
          coupleId,
          userId: null,
          type: "ANNIVERSARY_REMINDER",
          title: daysUntil === 0
            ? `今天是「${a.title}」！`
            : `距离「${a.title}」还有 ${daysUntil} 天`,
          body: a.note ?? undefined,
          data: {
            anniversaryId: a.id,
            daysUntil,
            nextDate: nextDate.toISOString()
          }
        }
      });

      newNotifications.push(notification);
    }

    return ok({
      checked: anniversaries.length,
      created: newNotifications.length,
      notifications: newNotifications
    });
  } catch (error) {
    return handleApiError(error);
  }
}
