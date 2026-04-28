import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  noContent,
  ok,
  parseOptionalJson
} from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";
import { deleteWithUserSchema, moodUpdateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    moodId: string;
  }>;
};

async function requireMood(coupleId: string, moodId: string) {
  const mood = await prisma.moodCheckIn.findFirst({
    where: { id: moodId, coupleId }
  });

  if (!mood) {
    throw new ApiError(404, "MOOD_NOT_FOUND", "心情记录不存在");
  }

  return mood;
}

function assertCanEditMood(mood: { userId: string }, userId?: string) {
  if (mood.userId !== userId) {
    throw new ApiError(403, "MOOD_OWNER_REQUIRED", "只能修改自己的心情记录");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, moodId } = await context.params;
    const input = await parseOptionalJson(request, moodUpdateSchema, {});
    const userId = input.userId ?? getRequesterId(request);
    await requireCoupleMember(coupleId, userId);
    const existing = await requireMood(coupleId, moodId);
    assertCanEditMood(existing, userId);

    const mood = await prisma.moodCheckIn.update({
      where: { id: moodId },
      data: {
        mood: input.mood,
        energy: input.energy,
        stressLevel: input.stressLevel,
        carePreference: input.carePreference,
        note: input.note,
        checkedAt: input.checkedAt
      },
      include: { user: true }
    });

    return ok(mood);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, moodId } = await context.params;
    const input = await parseOptionalJson(request, deleteWithUserSchema, {});
    const userId = input.userId ?? getRequesterId(request);
    await requireCoupleMember(coupleId, userId);
    const existing = await requireMood(coupleId, moodId);
    assertCanEditMood(existing, userId);
    await prisma.moodCheckIn.delete({
      where: { id: moodId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
