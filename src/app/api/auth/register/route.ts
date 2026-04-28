import { handleApiError, parseJson } from "@/lib/api/http";
import { authRegisterSchema } from "@/lib/api/schemas";
import { registerUser } from "@/lib/auth/user";
import { buildSessionCookie, createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, authRegisterSchema);
    const user = await registerUser(input);
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
