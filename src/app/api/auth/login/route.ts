import { handleApiError, parseJson } from "@/lib/api/http";
import { authLoginSchema } from "@/lib/api/schemas";
import { authenticateUser } from "@/lib/auth/user";
import { buildSessionCookie, createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, authLoginSchema);
    const user = await authenticateUser(input.email, input.password);
    const { token, session } = await createSession(user.id);

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
