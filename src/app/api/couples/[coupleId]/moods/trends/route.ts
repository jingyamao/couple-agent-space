import { z } from "zod";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { handleApiError, ok } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{ coupleId: string }>;
};

const trendsQuerySchema = z.object({
  period: z.enum(["day", "week", "month"]).default("week"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});

type TrendBucket = {
  period: string;
  count: number;
  avgStress: number;
  energyDistribution: { LOW: number; MEDIUM: number; HIGH: number };
  moods: string[];
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));

    const url = new URL(request.url);
    const query = trendsQuerySchema.parse({
      period: url.searchParams.get("period") ?? "week",
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined
    });

    const to = query.to ?? new Date();
    const from = query.from ?? new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);

    const moods = await prisma.moodCheckIn.findMany({
      where: {
        coupleId,
        checkedAt: { gte: from, lte: to }
      },
      orderBy: { checkedAt: "asc" }
    });

    const buckets = new Map<string, typeof moods>();

    for (const mood of moods) {
      let key: string;
      const d = new Date(mood.checkedAt);

      if (query.period === "day") {
        key = format(d, "yyyy-MM-dd");
      } else if (query.period === "week") {
        key = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-'W'ww");
      } else {
        key = format(startOfMonth(d), "yyyy-MM");
      }

      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key)!.push(mood);
    }

    const result: TrendBucket[] = [];

    for (const [period, periodMoods] of buckets) {
      const avgStress =
        periodMoods.reduce((sum, m) => sum + m.stressLevel, 0) /
        periodMoods.length;

      const energyDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0 };
      for (const m of periodMoods) {
        energyDistribution[m.energy]++;
      }

      const uniqueMoods = [...new Set(periodMoods.map((m) => m.mood))];

      result.push({
        period,
        count: periodMoods.length,
        avgStress: Math.round(avgStress * 10) / 10,
        energyDistribution,
        moods: uniqueMoods
      });
    }

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
