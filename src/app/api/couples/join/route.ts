import { prisma } from "@/lib/prisma";
import { ApiError, created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { resolveActorId } from "@/lib/api/guards";
import { coupleJoinSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, coupleJoinSchema);
    const userId = await resolveActorId(request, input.userId);

    const couple = await prisma.couple.findUnique({
      where: { inviteCode: input.inviteCode },
      include: { members: true }
    });

    if (!couple) {
      throw new ApiError(404, "INVITE_NOT_FOUND", "邀请码不存在");
    }

    const existing = couple.members.find(
      (member) => member.userId === userId
    );

    if (existing) {
      return ok(existing);
    }

    if (couple.members.length >= 2) {
      throw new ApiError(409, "COUPLE_FULL", "该情侣空间已经有两位成员");
    }

    const membership = await prisma.coupleMember.create({
      data: {
        coupleId: couple.id,
        userId,
        role: "PARTNER"
      },
      include: {
        couple: true,
        user: true
      }
    });

    return created(membership);
  } catch (error) {
    return handleApiError(error);
  }
}
