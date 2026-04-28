import {
  relationshipAgentRequestSchema,
  runRelationshipAgent
} from "@/lib/ai/relationship-agent";

export async function POST(request: Request) {
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

  const result = await runRelationshipAgent(parsed.data);

  return Response.json(result, {
    status: result.status === "error" ? 500 : 200
  });
}
