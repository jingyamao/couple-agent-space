import { prisma } from "@/lib/prisma";
import { ApiError, getSearchParam, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getAuthenticatedUser } from "@/lib/api/guards";
import { userCreateSchema } from "@/lib/api/schemas";
import { registerUser } from "@/lib/auth/user";
import { buildSessionCookie, createSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const requester = await getAuthenticatedUser(request);
    const id = getSearchParam(request, "id");
    const email = getSearchParam(request, "email");

    if (id || email) {
      const user = await prisma.user.findUnique({
        where: id ? { id } : { email: email as string },
        include: {
          memberships: {
            include: {
              couple: true
            }
          }
        }
      });

      if (user?.id !== requester.id) {
        throw new ApiError(403, "SELF_REQUIRED", "只能查询自己的用户资料");
      }

      return ok(user);
    }

    const user = await prisma.user.findUnique({
      where: { id: requester.id },
      include: {
        memberships: {
          include: {
            couple: true
          }
        }
      }
    });

    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, userCreateSchema);
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
