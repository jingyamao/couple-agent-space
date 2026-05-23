import { differenceInDays, addYears } from "date-fns";
import { prisma } from "@/lib/prisma";
import { handleApiError, ok } from "@/lib/api/http";
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

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));

    const anniversaries = await prisma.anniversary.findMany({
      where: { coupleId },
      orderBy: { happenedAt: "asc" }
    });

    const reminders = anniversaries
      .map((a) => {
        const nextDate = getNextOccurrence(a.happenedAt);
        const daysUntil = differenceInDays(nextDate, new Date());
        const shouldRemind = a.remindDays.some((d) => d >= daysUntil);

        return {
          id: a.id,
          title: a.title,
          happenedAt: a.happenedAt,
          nextDate,
          daysUntil,
          remindDays: a.remindDays,
          shouldRemind,
          note: a.note
        };
      })
      .filter((r) => r.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return ok(reminders);
  } catch (error) {
    return handleApiError(error);
  }
}
