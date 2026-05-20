import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { created, handleApiError, parseJson } from "@/lib/api/http";
import { resolveActorId, requireCoupleMember } from "@/lib/api/guards";
import { agentToolSchemas } from "@/lib/ai/tools";

const confirmSchema = z.object({
  coupleId: z.string().min(1),
  userId: z.string().optional(),
  draft: z.object({
    tool: z.string(),
    args: z.record(z.string(), z.unknown())
  })
});

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, confirmSchema);
    const userId = await resolveActorId(request, input.userId ?? undefined);
    await requireCoupleMember(input.coupleId, userId);

    const { tool, args } = input.draft;

    if (tool === "create_anniversary_draft") {
      const schema = agentToolSchemas.create_anniversary_draft.parameters;
      const parsed = schema.parse(args);
      const anniversary = await prisma.anniversary.create({
        data: {
          coupleId: input.coupleId,
          title: parsed.title,
          happenedAt: new Date(parsed.happenedAt),
          remindDays: parsed.remindDays,
          note: parsed.note
        }
      });
      return created({ type: "anniversary", data: anniversary });
    }

    if (tool === "create_wish_draft") {
      const schema = agentToolSchemas.create_wish_draft.parameters;
      const parsed = schema.parse(args);
      const wish = await prisma.wish.create({
        data: {
          coupleId: input.coupleId,
          creatorId: userId,
          title: parsed.title,
          category: parsed.category,
          status: "IDEA",
          targetAt: parsed.targetAt ? new Date(parsed.targetAt) : undefined,
          budgetCents: parsed.budgetCents,
          note: parsed.note
        }
      });
      return created({ type: "wish", data: wish });
    }

    if (tool === "create_diary_draft") {
      const schema = agentToolSchemas.create_diary_draft.parameters;
      const parsed = schema.parse(args);
      const diary = await prisma.diaryEntry.create({
        data: {
          coupleId: input.coupleId,
          authorId: userId,
          title: parsed.title,
          content: parsed.content,
          visibility: parsed.visibility
        }
      });
      return created({ type: "diary", data: diary });
    }

    return handleApiError(
      new (await import("@/lib/api/http")).ApiError(400, "UNKNOWN_TOOL", `未知的工具: ${tool}`)
    );
  } catch (error) {
    return handleApiError(error);
  }
}
