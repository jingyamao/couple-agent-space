import {
  relationshipAgentRequestSchema,
  runRelationshipAgent
} from "@/lib/ai/relationship-agent";
import { requireCoupleMember } from "@/lib/api/guards";
import { handleApiError } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = relationshipAgentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "INVALID_AGENT_REQUEST",
          detail: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    if (parsed.data.coupleId && parsed.data.userId) {
      await requireCoupleMember(parsed.data.coupleId, parsed.data.userId);
    }

    const result = await runRelationshipAgent(parsed.data);

    if (parsed.data.coupleId || parsed.data.userId) {
      await prisma.agentRun.create({
        data: {
          coupleId: parsed.data.coupleId,
          userId: parsed.data.userId,
          intent: parsed.data.intent,
          input: parsed.data,
          output: result,
          status:
            result.status === "success"
              ? "SUCCESS"
              : result.status === "fallback"
                ? "FALLBACK"
                : "ERROR"
        }
      });
    }

    return Response.json(result, {
      status: result.status === "error" ? 500 : 200
    });
  } catch (error) {
    return handleApiError(error);
  }
}
