import { prisma } from "@/lib/prisma";

export function GET() {
  return prisma
    .$queryRaw`select 1 as ok`
    .then(() =>
      Response.json({
        ok: true,
        service: "couple-agent-space",
        timestamp: new Date().toISOString(),
        checks: {
          app: "ready",
          database: "ready",
          ai: process.env.OPENAI_API_KEY ? "configured" : "fallback"
        }
      })
    )
    .catch((error) =>
      Response.json(
        {
          ok: false,
          service: "couple-agent-space",
          timestamp: new Date().toISOString(),
          checks: {
            app: "ready",
            database: "error",
            ai: process.env.OPENAI_API_KEY ? "configured" : "fallback"
          },
          error: error instanceof Error ? error.message : "Database unavailable"
        },
        { status: 503 }
      )
    );
}
