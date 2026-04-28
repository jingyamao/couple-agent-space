import { prisma } from "@/lib/prisma";
import { createUniqueInviteCode } from "@/lib/api/invite-code";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireUser, resolveActorId } from "@/lib/api/guards";
import { coupleCreateSchema } from "@/lib/api/schemas";

export async function GET(request: Request) {
  try {
    const userId = await getRequesterId(request);
    await requireUser(userId);

    const memberships = await prisma.coupleMember.findMany({
      where: { userId },
      include: {
        couple: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: "desc" }
    });

    return ok(memberships.map((membership) => membership.couple));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, coupleCreateSchema);
    const ownerId = await resolveActorId(request, input.ownerId);

    const couple = await prisma.$transaction(async (tx) => {
      const createdCouple = await tx.couple.create({
        data: {
          inviteCode: await createUniqueInviteCode(),
          title: input.title,
          startedAt: input.startedAt
        }
      });

      await tx.coupleMember.create({
        data: {
          coupleId: createdCouple.id,
          userId: ownerId,
          role: "OWNER"
        }
      });

      return tx.couple.findUniqueOrThrow({
        where: { id: createdCouple.id },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      });
    });

    return created(couple);
  } catch (error) {
    return handleApiError(error);
  }
}
