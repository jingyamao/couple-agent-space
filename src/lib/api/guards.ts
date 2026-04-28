import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/http";
import {
  getDevUserId,
  getSessionFromRequest
} from "@/lib/auth/session";

export async function getRequesterId(request: Request) {
  const session = await getSessionFromRequest(request);

  return session?.userId ?? getDevUserId(request);
}

export async function getAuthenticatedUser(request: Request) {
  const session = await getSessionFromRequest(request);

  if (session?.user) {
    return session.user;
  }

  const devUserId = getDevUserId(request);

  if (devUserId) {
    return requireUser(devUserId);
  }

  throw new ApiError(401, "AUTH_REQUIRED", "请先登录");
}

export async function resolveActorId(
  request: Request,
  explicitUserId?: string
) {
  const requesterId = await getRequesterId(request);

  if (requesterId && explicitUserId && requesterId !== explicitUserId) {
    throw new ApiError(403, "USER_MISMATCH", "不能代替其他用户操作");
  }

  const actorId = requesterId ?? explicitUserId;

  if (!actorId) {
    throw new ApiError(401, "AUTH_REQUIRED", "请先登录");
  }

  await requireUser(actorId);

  return actorId;
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

export async function requireSelf(request: Request, userId: string) {
  const requesterId = await getRequesterId(request);

  if (!requesterId) {
    throw new ApiError(401, "AUTH_REQUIRED", "请先登录");
  }

  if (requesterId !== userId) {
    throw new ApiError(403, "SELF_REQUIRED", "只能访问自己的账号");
  }

  return requireUser(userId);
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
