"use client";

import { FormEvent, useState } from "react";
import { Bot, Loader2, SendHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AgentResult = { status: "success" | "fallback" | "error"; reply: string; quickActions: string[]; safetyNote?: string };

const intentOptions = [
  { label: "日常关心", value: "daily_care" },
  { label: "约会计划", value: "date_plan" },
  { label: "日记润色", value: "diary" },
  { label: "冷静沟通", value: "conflict_repair" }
];

export function AgentPanel({ coupleId }: { coupleId?: string }) {
  const [intent, setIntent] = useState(intentOptions[0].value);
  const [message, setMessage] = useState("她今天工作很累，我想让她轻松一点");
  const [result, setResult] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) return;
    setIsLoading(true);
    const res = await fetch("/api/agents/relationship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, message, coupleId, context: { currentMood: "需要鼓励", partnerMood: "工作忙" } })
    });
    setResult((await res.json()) as AgentResult);
    setIsLoading(false);
  }

  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="size-5 text-[var(--primary)]" />
            <div className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--success)]" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-serif)" }}>关系助手</h2>
            <p className="text-xs text-[var(--muted-foreground)]">写入前需要确认</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {intentOptions.map((o) => (
            <button
              className={`rounded-xl px-2 py-1.5 text-xs font-medium transition-all duration-200 ${intent === o.value ? "bg-[var(--primary)] text-white shadow-sm" : "bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--surface-strong)]"}`}
              key={o.value}
              onClick={() => setIntent(o.value)}
              type="button"
            >{o.label}</button>
          ))}
        </div>

        <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
          <textarea
            className="min-h-20 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm outline-none backdrop-blur-sm transition-all duration-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--nav-active)]"
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          <div className="flex justify-end">
            <Button disabled={isLoading} size="sm" type="submit">
              {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <><SendHorizontal className="size-3.5" /> 发送</>}
            </Button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          <motion.div
            key={result?.reply ?? "default"}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl bg-[var(--surface)] p-4 backdrop-blur-sm"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm leading-6">{result?.reply ?? "今晚先让对方卸下压力：一句短关心，一件小帮忙，再留出安静陪伴的时间。"}</p>
            {result?.safetyNote && <p className="mt-3 rounded-xl bg-[var(--danger-bg)] p-3 text-xs text-[var(--primary-dark)]">{result.safetyNote}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(result?.quickActions ?? ["生成关心提醒", "创建今晚小任务", "记录今日心情"]).map((a) => <Badge key={a} tone="neutral">{a}</Badge>)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
