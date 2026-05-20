import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  noContent,
  ok,
  parseOptionalJson
} from "@/lib/api/http";
import { requireCoupleMember, resolveActorId } from "@/lib/api/guards";
import { deleteWithUserSchema, photoUpdateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    photoId: string;
  }>;
};

async function requirePhoto(coupleId: string, photoId: string) {
  const photo = await prisma.photo.findFirst({
    where: { id: photoId, coupleId }
  });

  if (!photo) {
    throw new ApiError(404, "PHOTO_NOT_FOUND", "照片记录不存在");
  }

  return photo;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, photoId } = await context.params;
    const input = await parseOptionalJson(request, photoUpdateSchema, {});
    const userId = await resolveActorId(request, input.userId);
    await requireCoupleMember(coupleId, userId);
    const existing = await requirePhoto(coupleId, photoId);

    if (existing.uploaderId !== userId) {
      throw new ApiError(403, "PHOTO_OWNER_REQUIRED", "只能修改自己上传的照片");
    }

    const photo = await prisma.photo.update({
      where: { id: photoId },
      data: {
        url: input.url,
        title: input.title,
        event: input.event,
        takenAt: input.takenAt
      },
      include: { uploader: true }
    });

    return ok(photo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, photoId } = await context.params;
    const input = await parseOptionalJson(request, deleteWithUserSchema, {});
    const userId = await resolveActorId(request, input.userId);
    await requireCoupleMember(coupleId, userId);
    const photo = await requirePhoto(coupleId, photoId);

    if (photo.uploaderId !== userId) {
      throw new ApiError(403, "PHOTO_OWNER_REQUIRED", "只能删除自己上传的照片");
    }
    await prisma.photo.delete({
      where: { id: photoId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
