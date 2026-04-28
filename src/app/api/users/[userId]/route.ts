import { prisma } from "@/lib/prisma";
import { handleApiError, noContent, ok, parseJson } from "@/lib/api/http";
import { requireUser } from "@/lib/api/guards";
import { userUpdateSchema } from "@/lib/api/schemas";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    await requireUser(userId);
    const input = await parseJson(request, userUpdateSchema);
    const user = await prisma.user.update({
      where: { id: userId },
      data: input
    });

    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    await requireUser(userId);
    await prisma.user.delete({
      where: { id: userId }
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
