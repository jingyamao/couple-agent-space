import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, noContent, ok, parseJson } from "@/lib/api/http";
import { getRequesterId, requireCoupleMember } from "@/lib/api/guards";

type RouteContext = {
  params: Promise<{ coupleId: string; memoryId: string }>;
};

async function requireMemory(coupleId: string, memoryId: string) {
  const memory = await prisma.agentMemory.findFirst({
    where: { id: memoryId, coupleId }
  });
  if (!memory) {
    throw new ApiError(404, "MEMORY_NOT_FOUND", "记忆不存在");
  }
  return memory;
}

const memoryUpdateSchema = z.object({
  value: z.unknown()
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { coupleId, memoryId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));
    await requireMemory(coupleId, memoryId);
    const input = await parseJson(request, memoryUpdateSchema);

    const memory = await prisma.agentMemory.update({
      where: { id: memoryId },
      data: { value: input.value as object }
    });

    return ok(memory);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { coupleId, memoryId } = await context.params;
    await requireCoupleMember(coupleId, await getRequesterId(request));
    await requireMemory(coupleId, memoryId);

    await prisma.agentMemory.delete({ where: { id: memoryId } });
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
