import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getAuthenticatedUser, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{ coupleId: string }>;
};

const checkInCreateSchema = z.object({
  title: z.string().min(1).max(120),
  note: z.string().max(1000).optional(),
  imageUrl: z.string().url().max(1000).optional(),
  location: z.string().max(200).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  address: z.string().max(500).optional(),
  checkedAt: z.coerce.date().optional()
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const user = await getAuthenticatedUser(request);
    await requireCoupleMember(coupleId, user.id);

    const checkins = await prisma.checkIn.findMany({
      where: { coupleId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { checkedAt: "desc" },
      take: 100
    });

    return ok(checkins);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const user = await getAuthenticatedUser(request);
    await requireCoupleMember(coupleId, user.id);
    const input = await parseJson(request, checkInCreateSchema);

    const checkin = await prisma.checkIn.create({
      data: {
        coupleId,
        userId: user.id,
        title: input.title,
        note: input.note,
        imageUrl: input.imageUrl,
        location: input.location,
        longitude: input.longitude,
        latitude: input.latitude,
        address: input.address,
        checkedAt: input.checkedAt ?? new Date()
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } }
    });

    return created(checkin);
  } catch (error) {
    return handleApiError(error);
  }
}
