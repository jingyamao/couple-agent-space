export function GET() {
  return Response.json({
    ok: true,
    service: "couple-agent-space",
    timestamp: new Date().toISOString(),
    checks: {
      app: "ready",
      database: "configured",
      ai: process.env.OPENAI_API_KEY ? "configured" : "fallback"
    }
  });
}
