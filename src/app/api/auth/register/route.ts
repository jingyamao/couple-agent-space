import { handleApiError, parseJson } from "@/lib/api/http";
import { authRegisterSchema } from "@/lib/api/schemas";
import { registerUser } from "@/lib/auth/user";
import { buildSessionCookie, createSession } from "@/lib/auth/session";
import { throwIfRateLimited } from "@/lib/api/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    throwIfRateLimited(
      `rate:register:${ip}`,
      { windowMs: 60 * 60 * 1000, maxRequests: 5 },
      "注册尝试过多，请 1 小时后再试"
    );

    const input = await parseJson(request, authRegisterSchema);
    const user = await registerUser(input);
    const ua = request.headers.get("user-agent") ?? undefined;
    const { token, session } = await createSession(user.id, {
      ipAddress: ip !== "unknown" ? ip : undefined,
      userAgent: ua
    });

    return Response.json(
      {
        data: {
          user,
          token,
          session: {
            expiresAt: session.expiresAt
          }
        }
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": buildSessionCookie(token, session.expiresAt)
        }
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
