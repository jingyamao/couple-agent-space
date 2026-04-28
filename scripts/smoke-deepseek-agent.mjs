const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

const response = await fetch(`${baseUrl}/api/agents/relationship`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    intent: "daily_care",
    message: "请用不超过20个字回复：今晚如何轻松关心对方？",
    context: {
      currentMood: "平稳",
      partnerMood: "有点累"
    }
  })
});

const payload = await response.json();

if (!response.ok) {
  throw new Error(`DeepSeek smoke failed: ${response.status} ${JSON.stringify(payload)}`);
}

if (payload.status !== "success" || payload.provider !== "deepseek") {
  throw new Error(`Expected DeepSeek success, got ${JSON.stringify(payload)}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      provider: payload.provider,
      model: payload.model,
      replyPreview: String(payload.reply).slice(0, 80)
    },
    null,
    2
  )
);
