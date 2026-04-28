import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";

export type AgentModelProvider = "deepseek" | "openai";

type GenerateAgentTextInput = {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

type GenerateAgentTextResult = {
  text: string;
  provider: AgentModelProvider;
  model: string;
};

function getConfiguredProvider() {
  const explicitProvider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (explicitProvider === "deepseek" || explicitProvider === "openai") {
    return explicitProvider;
  }

  if (process.env.DEEPSEEK_API_KEY) {
    return "deepseek";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return undefined;
}

export function getAgentModelRuntimeInfo() {
  const provider = getConfiguredProvider();

  if (!provider) {
    return {
      status: "fallback" as const
    };
  }

  if (provider === "deepseek") {
    return {
      status: process.env.DEEPSEEK_API_KEY ? ("configured" as const) : ("missing_key" as const),
      provider,
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro",
      baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"
    };
  }

  return {
    status: process.env.OPENAI_API_KEY ? ("configured" as const) : ("missing_key" as const),
    provider,
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
  };
}

async function generateWithDeepSeek(
  input: GenerateAgentTextInput
): Promise<GenerateAgentTextResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const baseURL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro";
  const client = new OpenAI({
    baseURL,
    apiKey
  });
  const completion = (await client.chat.completions.create({
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.prompt }
    ],
    model,
    thinking: {
      type: process.env.DEEPSEEK_THINKING_TYPE ?? "enabled"
    },
    reasoning_effort: process.env.DEEPSEEK_REASONING_EFFORT ?? "high",
    temperature: input.temperature ?? 0.6,
    max_tokens: input.maxTokens ?? 220,
    stream: false
  } as Parameters<typeof client.chat.completions.create>[0])) as ChatCompletion;

  const text = completion.choices[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("DeepSeek returned an empty response");
  }

  return {
    text,
    provider: "deepseek",
    model
  };
}

async function generateWithOpenAI(
  input: GenerateAgentTextInput
): Promise<GenerateAgentTextResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const result = await generateText({
    model: openai(model),
    system: input.system,
    prompt: input.prompt,
    temperature: input.temperature ?? 0.6,
    maxOutputTokens: input.maxTokens ?? 220
  });

  return {
    text: result.text,
    provider: "openai",
    model
  };
}

export async function generateAgentText(input: GenerateAgentTextInput) {
  const provider = getConfiguredProvider();

  if (!provider) {
    return null;
  }

  if (provider === "deepseek") {
    return generateWithDeepSeek(input);
  }

  return generateWithOpenAI(input);
}
