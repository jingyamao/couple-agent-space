import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";
import { photoCreateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, getRequesterId(request));

    const photos = await prisma.photo.findMany({
      where: { coupleId },
      include: { uploader: true },
      orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
      take: 100
    });

    return ok(photos);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, photoCreateSchema);
    await requireCoupleMember(coupleId, input.uploaderId);

    const photo = await prisma.photo.create({
      data: {
        coupleId,
        uploaderId: input.uploaderId,
        url: input.url,
        title: input.title,
        event: input.event,
        takenAt: input.takenAt
      },
      include: { uploader: true }
    });

    return created(photo);
  } catch (error) {
    return handleApiError(error);
  }
}
