import { signOssUrl } from "./oss";

export function signUserAvatar<T extends { avatarUrl?: string | null }>(user: T): T {
  if (user.avatarUrl) {
    return { ...user, avatarUrl: signOssUrl(user.avatarUrl) };
  }
  return user;
}

export function signPhotoUrl<T extends { url?: string | null }>(photo: T): T {
  if (photo.url) {
    return { ...photo, url: signOssUrl(photo.url) };
  }
  return photo;
}

export function signImageUrl<T extends { imageUrl?: string | null }>(item: T): T {
  if (item.imageUrl) {
    return { ...item, imageUrl: signOssUrl(item.imageUrl) };
  }
  return item;
}

export function signMembers<T extends { user?: { avatarUrl?: string | null } }>(members: T[]): T[] {
  return members.map((m) => ({
    ...m,
    user: m.user ? signUserAvatar(m.user) : m.user
  }));
}
