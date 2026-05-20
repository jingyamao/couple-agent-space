import { handleApiError, parseJson } from "@/lib/api/http";
import { authLoginSchema } from "@/lib/api/schemas";
import { authenticateUser } from "@/lib/auth/user";
import { buildSessionCookie, createSession } from "@/lib/auth/session";
import { throwIfRateLimited } from "@/lib/api/rate-limit";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, authLoginSchema);

    throwIfRateLimited(
      `rate:login:${input.email.toLowerCase()}`,
      { windowMs: 15 * 60 * 1000, maxRequests: 10 },
      "登录尝试过多，请 15 分钟后再试"
    );

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    throwIfRateLimited(
      `rate:login-ip:${ip}`,
      { windowMs: 15 * 60 * 1000, maxRequests: 30 },
      "登录尝试过多，请稍后再试"
    );

    const user = await authenticateUser(input.email, input.password);
    const ua = request.headers.get("user-agent") ?? undefined;
    const { token, session } = await createSession(user.id, {
      ipAddress: ip !== "unknown" ? ip : undefined,
      userAgent: ua
    });

    return Response.json(
      {
        data: {
          user,
          session: {
            expiresAt: session.expiresAt
          }
        }
      },
      {
        headers: {
          "Set-Cookie": buildSessionCookie(token, session.expiresAt)
        }
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
