import { prisma } from "@/lib/prisma";
import { created, getSearchParam, handleApiError, ok, parseJson } from "@/lib/api/http";
import { userCreateSchema } from "@/lib/api/schemas";

export async function GET(request: Request) {
  try {
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

      return ok(user);
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return ok(users);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, userCreateSchema);
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: {
        name: input.name,
        avatarUrl: input.avatarUrl
      },
      create: input
    });

    return created(user);
  } catch (error) {
    return handleApiError(error);
  }
}
