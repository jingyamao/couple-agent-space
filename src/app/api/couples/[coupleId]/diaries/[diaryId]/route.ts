import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  noContent,
  ok,
  parseOptionalJson
} from "@/lib/api/http";
import {
  getRequesterId,
  requireCoupleMember,
  resolveActorId
} from "@/lib/api/guards";
import { deleteWithUserSchema, diaryUpdateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    coupleId: string;
    diaryId: string;
  }>;
};

async function requireDiary(coupleId: string, diaryId: string) {
  const diary = await prisma.diaryEntry.findFirst({
    where: { id: diaryId, coupleId },
    include: { author: true }
  });

  if (!diary) {
    throw new ApiError(404, "DIARY_NOT_FOUND", "日记不存在");
  }

  return diary;
}

function assertCanViewDiary(diary: { authorId: string; visibility: string }, userId?: string) {
  if (diary.visibility === "PRIVATE" && diary.authorId !== userId) {
    throw new ApiError(403, "DIARY_PRIVATE", "这篇日记仅作者可见");
  }
}

function assertCanEditDiary(diary: { authorId: string }, userId?: string) {
  if (diary.authorId !== userId) {
    throw new ApiError(403, "DIARY_AUTHOR_REQUIRED", "只有作者可以修改这篇日记");
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId, diaryId } = await context.params;
    const userId = await getRequesterId(request);
    await requireCoupleMember(coupleId, userId);
    const diary = await requireDiary(coupleId, diaryId);
    assertCanViewDiary(diary, userId);

    return ok(diary);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, diaryId } = await context.params;
    const input = await parseOptionalJson(request, diaryUpdateSchema, {});
    const userId = await resolveActorId(request, input.userId);
    await requireCoupleMember(coupleId, userId);
    const existing = await requireDiary(coupleId, diaryId);
    assertCanEditDiary(existing, userId);

    const diary = await prisma.diaryEntry.update({
      where: { id: diaryId },
      data: {
        title: input.title,
        content: input.content,
        visibility: input.visibility,
        happenedAt: input.happenedAt
      },
      include: { author: true }
    });

    return ok(diary);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, diaryId } = await context.params;
    const input = await parseOptionalJson(request, deleteWithUserSchema, {});
    const userId = await resolveActorId(request, input.userId);
    await requireCoupleMember(coupleId, userId);
    const existing = await requireDiary(coupleId, diaryId);
    assertCanEditDiary(existing, userId);
    await prisma.diaryEntry.delete({
      where: { id: diaryId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
