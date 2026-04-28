import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const SESSION_TTL_DAYS = 30;
const DEV_AUTH_HEADER_ENABLED = process.env.NODE_ENV !== "production";

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME ?? "couple_session";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return new Map<string, string>();

  return new Map(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");

        if (separatorIndex === -1) {
          return [part, ""] as const;
        }

        return [
          decodeURIComponent(part.slice(0, separatorIndex)),
          decodeURIComponent(part.slice(separatorIndex + 1))
        ] as const;
      })
  );
}

export function getDevUserId(request: Request) {
  if (!DEV_AUTH_HEADER_ENABLED) return undefined;

  const url = new URL(request.url);

  return (
    request.headers.get("x-user-id") ??
    url.searchParams.get("userId") ??
    undefined
  );
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);

  const session = await prisma.authSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt
    },
    include: {
      user: true
    }
  });

  return { token, session };
}

export async function getSessionFromRequest(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies.get(AUTH_COOKIE_NAME);

  if (!token) {
    return null;
  }

  const session = await prisma.authSession.findUnique({
    where: {
      tokenHash: hashToken(token)
    },
    include: {
      user: true
    }
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.authSession.delete({
      where: { id: session.id }
    });

    return null;
  }

  await prisma.authSession.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() }
  });

  return session;
}

export async function deleteSessionFromRequest(request: Request) {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies.get(AUTH_COOKIE_NAME);

  if (!token) return;

  await prisma.authSession
    .delete({
      where: {
        tokenHash: hashToken(token)
      }
    })
    .catch(() => undefined);
}

export function buildSessionCookie(token: string, expiresAt: Date) {
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function buildExpiredSessionCookie() {
  return [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ].join("; ");
}
