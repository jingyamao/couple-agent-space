import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { handleApiError, noContent, ok, parseJson } from "@/lib/api/http";
import { getAuthenticatedUser } from "@/lib/api/guards";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { z } from "zod";

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return new Map<string, string>();
  return new Map(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const i = part.indexOf("=");
        if (i === -1) return [part, ""] as const;
        return [
          decodeURIComponent(part.slice(0, i)),
          decodeURIComponent(part.slice(i + 1))
        ] as const;
      })
  );
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    const currentToken = cookies.get(AUTH_COOKIE_NAME);
    const currentHash = currentToken ? hashToken(currentToken) : null;

    const sessions = await prisma.authSession.findMany({
      where: { userId: user.id },
      orderBy: { lastUsedAt: "desc" },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceName: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        tokenHash: true
      }
    });

    const result = sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      deviceName: s.deviceName,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      expiresAt: s.expiresAt,
      isCurrent: s.tokenHash === currentHash
    }));

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

const revokeSchema = z.object({
  sessionId: z.string().min(1)
});

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const input = await parseJson(request, revokeSchema);

    const session = await prisma.authSession.findFirst({
      where: {
        id: input.sessionId,
        userId: user.id
      }
    });

    if (!session) {
      return noContent();
    }

    await prisma.authSession.delete({
      where: { id: input.sessionId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
