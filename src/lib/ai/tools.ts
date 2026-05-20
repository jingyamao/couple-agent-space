import { z } from "zod";

export const agentToolSchemas = {
  create_anniversary_draft: {
    description: "创建纪念日草稿，等待用户确认后写入系统",
    parameters: z.object({
      title: z.string().describe("纪念日名称"),
      happenedAt: z.string().describe("日期，ISO 格式"),
      remindDays: z.array(z.number()).describe("提前提醒天数"),
      note: z.string().optional().describe("备注")
    })
  },
  create_wish_draft: {
    description: "创建愿望草稿，等待用户确认后写入系统",
    parameters: z.object({
      title: z.string().describe("愿望名称"),
      category: z.string().describe("分类"),
      targetAt: z.string().optional().describe("目标日期"),
      budgetCents: z.number().optional().describe("预算（分）"),
      note: z.string().optional().describe("备注")
    })
  },
  create_diary_draft: {
    description: "创建日记草稿，等待用户确认后写入系统",
    parameters: z.object({
      title: z.string().describe("日记标题"),
      content: z.string().describe("日记内容"),
      visibility: z.enum(["PRIVATE", "PARTNER", "SHARED"]).describe("可见范围")
    })
  }
};

export type AgentDraft = {
  tool: string;
  args: Record<string, unknown>;
};

export function getToolDefinitions() {
  return Object.entries(agentToolSchemas).map(([name, schema]) => ({
    type: "function" as const,
    function: {
      name,
      description: schema.description,
      parameters: {
        type: "object" as const,
        properties: Object.fromEntries(
          Object.entries(schema.parameters.shape).map(([key, val]) => [
            key,
            { type: "string", description: (val as z.ZodTypeAny).description ?? "" }
          ])
        ),
        required: Object.entries(schema.parameters.shape)
          .filter(([, val]) => !(val instanceof z.ZodOptional))
          .map(([key]) => key)
      }
    }
  }));
}
