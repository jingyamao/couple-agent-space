import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { created, handleApiError, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{ coupleId: string }>;
};

const memoryCreateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown()
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));

    const memories = await prisma.agentMemory.findMany({
      where: { coupleId },
      orderBy: { updatedAt: "desc" }
    });

    return ok(memories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { coupleId } = await context.params;
    const input = await parseJson(request, memoryCreateSchema);
    await requireCoupleMember(coupleId, await getRequesterId(request));

    const memory = await prisma.agentMemory.upsert({
      where: {
        coupleId_key: { coupleId, key: input.key }
      },
      update: { value: input.value as object },
      create: {
        coupleId,
        key: input.key,
        value: input.value as object
      }
    });

    return created(memory);
  } catch (error) {
    return handleApiError(error);
  }
}
