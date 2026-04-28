import { z } from "zod";
import { generateAgentText } from "@/lib/ai/model-provider";

const agentIntentSchema = z.enum([
  "daily_care",
  "diary",
  "anniversary",
  "date_plan",
  "conflict_repair",
  "wish",
  "weekly_review"
]);

export const relationshipAgentRequestSchema = z.object({
  intent: agentIntentSchema.default("daily_care"),
  message: z.string().min(1).max(2000),
  coupleId: z.string().min(1).max(128).optional(),
  userId: z.string().min(1).max(128).optional(),
  context: z
    .object({
      relationshipDays: z.number().int().nonnegative().optional(),
      city: z.string().max(80).optional(),
      budget: z.string().max(80).optional(),
      currentMood: z.string().max(80).optional(),
      partnerMood: z.string().max(80).optional()
    })
    .default({})
});

export type RelationshipAgentRequest = z.infer<
  typeof relationshipAgentRequestSchema
>;

export type RelationshipAgentResult = {
  status: "success" | "fallback" | "error";
  intent: RelationshipAgentRequest["intent"];
  reply: string;
  quickActions: string[];
  safetyNote?: string;
  provider?: string;
  model?: string;
};

const SYSTEM_PROMPT = [
  "你是情侣私密生活协作系统里的关系助手 Agent。",
  "你的目标是降低用户操作成本，给出温和、具体、可执行的建议。",
  "默认只输出短建议，不做道德审判，不替用户做重大关系决定。",
  "涉及争吵、控制、暴力、自伤风险时，优先提醒用户保护现实安全并寻求可信赖的人或专业帮助。",
  "所有要写入系统的数据都必须让用户确认后再执行。"
].join("\n");

const fallbackReplies: Record<RelationshipAgentRequest["intent"], string> = {
  daily_care:
    "今天可以先发一句轻量关心，再安排一个不打扰对方节奏的小动作。建议：问问对方今晚是否想安静休息，或需不需要你帮忙处理一件小事。",
  diary:
    "可以整理成一篇共同日记：今天我们一起经历了一件平凡但值得记住的小事。保留具体场景、对方的状态，以及你想对对方说的一句话。",
  anniversary:
    "建议把这件事存成纪念日，并设置提前 7 天和 1 天提醒。标题用简单明确的名字，比如“第一次见面”或“在一起纪念日”。",
  date_plan:
    "给你一个省心方案：选择离双方都近的地点，安排一段主活动和一段自由聊天时间，预算先控制在可接受范围内，再加一个小惊喜。",
  conflict_repair:
    "先不要急着证明谁对谁错。可以按这三句表达：我当时的感受是，我真正需要的是，我希望下次我们可以怎么做。",
  wish:
    "这很适合加入愿望清单。先给它一个分类，再标记为“想做”，等双方都有空时再补预算、地点和日期。",
  weekly_review:
    "本周回顾可以从三件事开始：我们一起完成了什么、哪一刻让彼此感觉被在乎、下周想减少哪一种摩擦。"
};

const quickActions: Record<RelationshipAgentRequest["intent"], string[]> = {
  daily_care: ["生成关心提醒", "创建今晚小任务", "记录今日心情"],
  diary: ["生成日记草稿", "设为共同日记", "补充照片"],
  anniversary: ["创建纪念日", "设置提醒", "生成庆祝方案"],
  date_plan: ["生成约会清单", "加入愿望清单", "设置预算"],
  conflict_repair: ["打开冷静沟通", "生成表达模板", "稍后提醒复盘"],
  wish: ["加入愿望清单", "设置计划时间", "邀请对方确认"],
  weekly_review: ["生成周报", "创建下周目标", "保存回忆"]
};

function buildPrompt(input: RelationshipAgentRequest) {
  return [
    `意图：${input.intent}`,
    `用户输入：${input.message}`,
    `上下文：${JSON.stringify(input.context)}`,
    "请用中文输出，最多 160 字。",
    "格式：先给 1 个最佳建议，再给 2-3 个可执行下一步。"
  ].join("\n");
}

function containsSafetyRisk(message: string) {
  return /自杀|自残|伤害|打人|威胁|跟踪|监控|控制|家暴|暴力/.test(message);
}

export async function runRelationshipAgent(
  input: RelationshipAgentRequest
): Promise<RelationshipAgentResult> {
  const safetyNote = containsSafetyRisk(input.message)
    ? "如果存在现实暴力、自伤或被控制风险，请优先离开危险环境，并联系可信赖的人、当地紧急服务或专业机构。"
    : undefined;

  const modelResult = await generateAgentText({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(input),
    temperature: 0.6,
    maxTokens: 220
  }).catch(() => null);

  if (!modelResult) {
    return {
      status: "fallback",
      intent: input.intent,
      reply: fallbackReplies[input.intent],
      quickActions: quickActions[input.intent],
      safetyNote
    };
  }

  try {
    return {
      status: "success",
      intent: input.intent,
      reply: modelResult.text,
      quickActions: quickActions[input.intent],
      safetyNote,
      provider: modelResult.provider,
      model: modelResult.model
    };
  } catch {
    return {
      status: "error",
      intent: input.intent,
      reply: fallbackReplies[input.intent],
      quickActions: quickActions[input.intent],
      safetyNote
    };
  }
}
