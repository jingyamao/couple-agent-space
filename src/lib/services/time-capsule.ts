import { ApiError } from "@/lib/api/http";

export function assertCapsuleUnlocked(capsule: { unlockAt: Date; status: string }) {
  if (capsule.status === "LOCKED" && capsule.unlockAt.getTime() > Date.now()) {
    throw new ApiError(409, "TIME_CAPSULE_LOCKED", "时间胶囊还没到开启时间");
  }
}

export function hideLockedContent<T extends { unlockAt: Date; status: string; content: string | null }>(
  item: T
): T {
  if (item.status === "LOCKED" && item.unlockAt.getTime() > Date.now()) {
    return { ...item, content: null };
  }
  return item;
}

export function canEditCapsule(capsule: { status: string; unlockAt: Date }): boolean {
  return capsule.status !== "OPENED" && capsule.unlockAt.getTime() > Date.now();
}
