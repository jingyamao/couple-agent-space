"use client";

import { FormEvent, useState } from "react";
import { Bot, Loader2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AgentResult = {
  status: "success" | "fallback" | "error";
  reply: string;
  quickActions: string[];
  safetyNote?: string;
};

const intentOptions = [
  { label: "日常关心", value: "daily_care" },
  { label: "约会计划", value: "date_plan" },
  { label: "日记润色", value: "diary" },
  { label: "冷静沟通", value: "conflict_repair" }
];

export function AgentPanel() {
  const [intent, setIntent] = useState(intentOptions[0].value);
  const [message, setMessage] = useState("她今天工作很累，我想让她轻松一点");
  const [result, setResult] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const response = await fetch("/api/agents/relationship", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent,
        message,
        context: {
          relationshipDays: 642,
          city: "上海",
          currentMood: "需要一点鼓励",
          partnerMood: "工作有点满"
        }
      })
    });

    const data = (await response.json()) as AgentResult;
    setResult(data);
    setIsLoading(false);
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-[var(--secondary)]" />
            <h2 className="text-lg font-semibold">关系助手 Agent</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            默认给最短路径，写入系统前需要确认
          </p>
        </div>
        <Badge tone={result?.status === "success" ? "teal" : "gold"}>
          {result?.status === "success" ? "AI 在线" : "本地可用"}
        </Badge>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {intentOptions.map((option) => (
            <button
              aria-pressed={intent === option.value}
              className={`h-9 rounded-md border text-sm font-medium transition-colors ${
                intent === option.value
                  ? "border-[var(--primary)] bg-[#fff0f2] text-[#9d2b38]"
                  : "border-[var(--border)] bg-white text-[#655e55] hover:bg-[#f6f1ea]"
              }`}
              key={option.value}
              onClick={() => setIntent(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            className="min-h-24 flex-1 resize-none rounded-md border border-[var(--border)] bg-[#fffdf9] p-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(194,59,74,0.14)]"
            maxLength={500}
            onChange={(event) => setMessage(event.target.value)}
            value={message}
          />
          <Button
            aria-label="发送"
            className="self-end"
            disabled={isLoading}
            size="icon"
            type="submit"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
          </Button>
        </div>
      </form>

      <div className="mt-5 rounded-md bg-[#f7f3ed] p-4">
        <p className="text-sm leading-6 text-[#39332d]">
          {result?.reply ??
            "今晚先让对方卸下压力：一句短关心，一件小帮忙，再留出安静陪伴的时间。"}
        </p>
        {result?.safetyNote ? (
          <p className="mt-3 rounded-md bg-[#fff0f2] p-3 text-sm text-[#8f2531]">
            {result.safetyNote}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {(result?.quickActions ?? ["生成关心提醒", "创建今晚小任务", "记录今日心情"]).map(
            (action) => (
              <Badge key={action} tone="neutral">
                {action}
              </Badge>
            )
          )}
        </div>
      </div>
    </section>
  );
}
