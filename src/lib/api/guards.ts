import { prisma } from "@/lib/prisma";
import { ApiError, getSearchParam } from "@/lib/api/http";

export function getRequesterId(request: Request) {
  return (
    request.headers.get("x-user-id") ??
    getSearchParam(request, "userId") ??
    undefined
  );
}

export async function requireUser(userId: string | undefined) {
  if (!userId) {
    throw new ApiError(401, "USER_REQUIRED", "需要提供用户 ID");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "用户不存在");
  }

  return user;
}

export async function requireCoupleMember(
  coupleId: string,
  userId: string | undefined
) {
  await requireUser(userId);

  const member = await prisma.coupleMember.findUnique({
    where: {
      userId_coupleId: {
        userId: userId as string,
        coupleId
      }
    }
  });

  if (!member) {
    throw new ApiError(403, "COUPLE_FORBIDDEN", "你不是该情侣空间成员");
  }

  return member;
}

export async function requireCoupleOwner(
  coupleId: string,
  userId: string | undefined
) {
  const member = await requireCoupleMember(coupleId, userId);

  if (member.role !== "OWNER") {
    throw new ApiError(403, "OWNER_REQUIRED", "只有空间创建者可以执行该操作");
  }

  return member;
}
