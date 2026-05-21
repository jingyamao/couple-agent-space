"use client";

import {
  BookHeart, CalendarHeart, Sparkles, Star
} from "lucide-react";
import { format, differenceInDays, addYears } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCouple } from "@/hooks/use-couple";
import { useDashboard } from "@/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPanel } from "@/components/dashboard/agent-panel";
import { GoldenRetriever } from "@/components/dogs/golden-retriever";
import { WhitePuppy } from "@/components/dogs/white-puppy";
import { PawIcon } from "@/components/dogs/decorations";

function getNextOccurrence(happenedAt: string) {
  const date = new Date(happenedAt);
  const now = new Date();
  let next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (next.getTime() < now.getTime()) next = addYears(next, 1);
  return next;
}

const energyLabels: Record<string, string> = { HIGH: "精力充沛", LOW: "需要休息", MEDIUM: "状态平稳" };
const energyTones: Record<string, "teal" | "rose" | "gold"> = { HIGH: "teal", LOW: "rose", MEDIUM: "gold" };
const statusLabels: Record<string, string> = { DONE: "已完成", PLANNED: "进行中", PAUSED: "暂停", IDEA: "灵感" };
const statusTones: Record<string, "teal" | "gold" | "neutral" | "rose"> = { DONE: "teal", PLANNED: "gold", PAUSED: "neutral", IDEA: "rose" };

export default function DashboardPage() {
  const { couple } = useCouple();
  const { data, isLoading, error } = useDashboard(couple?.id ?? null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div style={{ animation: "gentle-bounce 1.5s ease-in-out infinite" }}>
          <GoldenRetriever size={80} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="py-20 text-center text-[var(--muted-foreground)]">{error ?? "暂无数据"}</div>;
  }

  const nextAnniversary = data.anniversaries[0];
  const daysUntil = nextAnniversary ? differenceInDays(getNextOccurrence(nextAnniversary.happenedAt), new Date()) : null;

  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="glass grid gap-5 rounded-3xl p-5 sm:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge tone="primary">已在一起 {data.couple.daysTogether ?? 0} 天</Badge>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">今天也把关系照顾得轻一点、稳一点。</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--surface)] p-4 backdrop-blur-sm">
              <p className="text-xs text-[var(--muted-foreground)]">下一纪念日</p>
              <p className="mt-1.5 font-semibold">{nextAnniversary?.title ?? "暂无"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface)] p-4 backdrop-blur-sm">
              <p className="text-xs text-[var(--muted-foreground)]">倒计时</p>
              <p className="mt-1.5 font-semibold">{daysUntil !== null ? `${daysUntil} 天` : "--"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface)] p-4 backdrop-blur-sm">
              <p className="text-xs text-[var(--muted-foreground)]">在一起日期</p>
              <p className="mt-1.5 font-semibold">{data.couple.startedAt ? format(new Date(data.couple.startedAt), "yyyy-MM-dd") : "未设置"}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawIcon size={24} />
              <span className="text-sm font-medium opacity-80">愿望进度</span>
            </div>
            <Badge tone="gold">{data.wishes.items.length} 个愿望</Badge>
          </div>
          <p className="mt-6 text-5xl font-bold">{data.wishes.progress}%</p>
          <Progress className="mt-4 bg-white/20" value={data.wishes.progress} />
          <p className="mt-3 text-sm opacity-80">
            其中 {data.wishes.items.filter((w) => w.status === "DONE").length} 个已完成，继续加油！
          </p>
          <div className="mt-2 flex justify-end">
            <div className="opacity-30"><WhitePuppy size={48} /></div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/diaries", icon: BookHeart, title: "写日记", desc: "记录你们的故事", bg: "rgba(91,155,213,0.1)" },
          { href: "/moods", icon: Sparkles, title: "记心情", desc: "今天的感受", bg: "rgba(245,160,177,0.1)" },
          { href: "/anniversaries", icon: CalendarHeart, title: "纪念日", desc: "重要的日子", bg: "rgba(255,209,102,0.12)" },
          { href: "/wishes", icon: Star, title: "愿望", desc: "一起许愿", bg: "rgba(107,197,160,0.1)" }
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link className="glass group flex items-center gap-3 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]" href={a.href} key={a.title}>
              <div className="flex size-11 items-center justify-center rounded-xl" style={{ background: a.bg }}>
                <Icon className="size-5 text-[var(--foreground)]" />
              </div>
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Moods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">最近心情</h2>
                <Badge tone="teal">{data.moodCheckIns.length} 条</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {data.moodCheckIns.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">还没有心情记录</p>
              ) : (
                <div className="grid gap-3">
                  {data.moodCheckIns.slice(0, 4).map((mood) => (
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-sm" key={mood.id}>
                      <div>
                        <p className="font-semibold">{mood.user.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{mood.mood}</p>
                      </div>
                      <Badge tone={energyTones[mood.energy]}>{energyLabels[mood.energy]}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wishes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">愿望清单</h2>
                <Link href="/wishes"><Button size="sm" variant="outline">查看全部</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.wishes.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">还没有愿望</p>
              ) : (
                <div className="space-y-4">
                  {data.wishes.items.slice(0, 5).map((wish) => (
                    <div key={wish.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{wish.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{wish.category}</p>
                        </div>
                        <Badge tone={statusTones[wish.status]}>{statusLabels[wish.status]}</Badge>
                      </div>
                      <Progress value={wish.status === "DONE" ? 100 : wish.status === "PLANNED" ? 50 : 0} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <AgentPanel coupleId={couple?.id} />

          <Card>
            <CardHeader><h2 className="text-lg font-semibold">最近日记</h2></CardHeader>
            <CardContent>
              {data.diaryEntries.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">还没有日记</p>
              ) : (
                <div className="space-y-3">
                  {data.diaryEntries.slice(0, 3).map((diary) => (
                    <div className="flex gap-3" key={diary.id}>
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(91,155,213,0.1)] text-[var(--primary)]">
                        <BookHeart className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{diary.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{diary.author.name} · {format(new Date(diary.happenedAt), "MM月dd日")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </motion.div>
    </div>
  );
}
