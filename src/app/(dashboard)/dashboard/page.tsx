"use client";

import { BookHeart, CalendarHeart, Heart, Sparkles, Star } from "lucide-react";
import { format, differenceInDays, addYears } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCouple } from "@/hooks/use-couple";
import { useDashboard } from "@/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPanel } from "@/components/dashboard/agent-panel";

function getNextOccurrence(happenedAt: string) {
  const date = new Date(happenedAt);
  const now = new Date();
  let next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (next.getTime() < now.getTime()) next = addYears(next, 1);
  return next;
}

const energyLabels: Record<string, string> = { HIGH: "精力充沛", LOW: "需要休息", MEDIUM: "平稳" };
const energyTones: Record<string, "teal" | "rose" | "gold"> = { HIGH: "teal", LOW: "rose", MEDIUM: "gold" };
const statusLabels: Record<string, string> = { DONE: "已完成", PLANNED: "进行中", PAUSED: "暂停", IDEA: "灵感" };
const statusTones: Record<string, "teal" | "gold" | "neutral" | "rose"> = { DONE: "teal", PLANNED: "gold", PAUSED: "neutral", IDEA: "rose" };

export default function DashboardPage() {
  const { couple } = useCouple();
  const { data, isLoading, error } = useDashboard(couple?.id ?? null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Heart className="size-10 text-[var(--primary)]" />
        </motion.div>
      </div>
    );
  }

  if (error || !data) return <div className="py-20 text-center text-[var(--muted-foreground)]">{error ?? "暂无数据"}</div>;

  const nextAnniversary = data.anniversaries[0];
  const daysUntil = nextAnniversary ? differenceInDays(getNextOccurrence(nextAnniversary.happenedAt), new Date()) : null;
  const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      {/* Couple Hero */}
      <motion.div {...fade} transition={{ duration: 0.5 }} className="glass overflow-hidden rounded-3xl">
        <div className="relative bg-gradient-to-r from-[var(--primary-light)] via-transparent to-[var(--secondary-light)] p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Couple Avatars with Heart */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ x: [0, 4, 0] }}
                className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-2xl font-bold text-white shadow-lg"
                transition={{ duration: 3, repeat: Infinity }}
              >
                {couple?.members[0]?.user.name.charAt(0) ?? "?"}
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="size-8 text-[var(--primary)]" fill="var(--primary)" />
              </motion.div>
              {couple?.members[1] && (
                <motion.div
                  animate={{ x: [0, -4, 0] }}
                  className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary-light)] to-[var(--secondary)] text-2xl font-bold text-white shadow-lg"
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  {couple.members[1].user.name.charAt(0)}
                </motion.div>
              )}
            </div>

            <div className="text-center sm:text-left">
              <Badge tone="rose">{data.couple.daysTogether ?? 0} 天</Badge>
              <h1 className="mt-2 text-2xl font-bold tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>{couple?.title}</h1>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
                {couple?.members.map((m) => m.user.name).join(" & ")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div {...fade} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "下一纪念日", value: nextAnniversary?.title ?? "暂无", sub: daysUntil !== null ? `${daysUntil} 天后` : "" },
          { label: "在一起", value: `${data.couple.daysTogether ?? 0}`, sub: "天" },
          { label: "愿望进度", value: `${data.wishes.progress}%`, sub: `${data.wishes.items.length} 个愿望` },
          { label: "日记", value: `${data.diaryEntries.length}`, sub: "篇" }
        ].map((s, i) => (
          <motion.div key={s.label} {...fade} transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
                <p className="mt-1 text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>{s.value}</p>
                {s.sub && <p className="text-xs text-[var(--muted-foreground)]">{s.sub}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fade} transition={{ duration: 0.5, delay: 0.15 }} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { href: "/diaries", icon: BookHeart, title: "写日记", color: "from-[var(--primary-light)] to-[var(--primary)]" },
          { href: "/moods", icon: Sparkles, title: "记心情", color: "from-[var(--accent-light)] to-[var(--accent)]" },
          { href: "/anniversaries", icon: CalendarHeart, title: "纪念日", color: "from-[var(--secondary-light)] to-[var(--secondary)]" },
          { href: "/wishes", icon: Star, title: "愿望", color: "from-[rgba(140,196,168,0.3)] to-[rgba(140,196,168,0.6)]" }
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link className="glass group flex flex-col items-center gap-2 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" href={a.href} key={a.title}>
              <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${a.color}`}>
                <Icon className="size-6 text-white" />
              </div>
              <span className="text-sm font-semibold">{a.title}</span>
            </Link>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <motion.div {...fade} transition={{ duration: 0.5, delay: 0.2 }} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Moods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>最近心情</h2>
                <Badge tone="teal">{data.moodCheckIns.length} 条</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {data.moodCheckIns.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">还没有心情记录</p>
              ) : (
                <div className="space-y-3">
                  {data.moodCheckIns.slice(0, 4).map((mood, i) => (
                    <motion.div key={mood.id} {...fade} transition={{ delay: i * 0.05 }} className="flex items-center justify-between rounded-2xl bg-[var(--surface)] p-4">
                      <div>
                        <p className="font-semibold">{mood.user.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{mood.mood}</p>
                      </div>
                      <Badge tone={energyTones[mood.energy]}>{energyLabels[mood.energy]}</Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wishes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>愿望清单</h2>
                <Link className="text-sm text-[var(--primary-dark)]" href="/wishes">查看全部</Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.wishes.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">还没有愿望</p>
              ) : (
                <div className="space-y-4">
                  {data.wishes.items.slice(0, 5).map((wish, i) => (
                    <motion.div key={wish.id} {...fade} transition={{ delay: i * 0.05 }}>
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{wish.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{wish.category}</p>
                        </div>
                        <Badge tone={statusTones[wish.status]}>{statusLabels[wish.status]}</Badge>
                      </div>
                      <Progress value={wish.status === "DONE" ? 100 : wish.status === "PLANNED" ? 50 : 0} />
                    </motion.div>
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
            <CardHeader><h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>最近日记</h2></CardHeader>
            <CardContent>
              {data.diaryEntries.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">还没有日记</p>
              ) : (
                <div className="space-y-3">
                  {data.diaryEntries.slice(0, 3).map((d, i) => (
                    <motion.div key={d.id} {...fade} transition={{ delay: i * 0.05 }} className="flex gap-3">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(232,160,176,0.1)] text-[var(--primary)]">
                        <BookHeart className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{d.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{d.author.name} · {format(new Date(d.happenedAt), "MM月dd日")}</p>
                      </div>
                    </motion.div>
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
