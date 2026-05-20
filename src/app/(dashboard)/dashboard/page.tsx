"use client";

import {
  BookHeart,
  CalendarHeart,
  Loader2,
  Sparkles,
  Star
} from "lucide-react";
import { format, differenceInDays, addYears } from "date-fns";
import Link from "next/link";
import { useCouple } from "@/hooks/use-couple";
import { useDashboard } from "@/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPanel } from "@/components/dashboard/agent-panel";

function getEnergyTone(energy: string) {
  if (energy === "HIGH") return "teal" as const;
  if (energy === "LOW") return "rose" as const;
  return "gold" as const;
}

function getStatusTone(status: string) {
  if (status === "DONE") return "teal" as const;
  if (status === "PLANNED") return "gold" as const;
  if (status === "PAUSED") return "neutral" as const;
  return "rose" as const;
}

function getNextOccurrence(happenedAt: string) {
  const date = new Date(happenedAt);
  const now = new Date();
  let next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (next.getTime() < now.getTime()) {
    next = addYears(next, 1);
  }
  return next;
}

function getAnniversaryDaysUntil(happenedAt: string) {
  const next = getNextOccurrence(happenedAt);
  return differenceInDays(next, new Date());
}

export default function DashboardPage() {
  const { couple } = useCouple();
  const { data, isLoading, error } = useDashboard(couple?.id ?? null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center text-[var(--muted-foreground)]">
        {error ?? "暂无数据"}
      </div>
    );
  }

  const nextAnniversary = data.anniversaries[0];
  const daysUntil = nextAnniversary
    ? getAnniversaryDaysUntil(nextAnniversary.happenedAt)
    : null;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm sm:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge tone="rose">已在一起 {data.daysTogether} 天</Badge>
          <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-normal text-[#24201c] sm:text-3xl">
            今天也把关系照顾得轻一点、稳一点。
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-[#f7f3ed] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">下一纪念日</p>
              <p className="mt-2 font-semibold">
                {nextAnniversary ? nextAnniversary.title : "暂无"}
              </p>
            </div>
            <div className="rounded-md bg-[#f7f3ed] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">倒计时</p>
              <p className="mt-2 font-semibold">
                {daysUntil !== null ? `${daysUntil} 天` : "--"}
              </p>
            </div>
            <div className="rounded-md bg-[#f7f3ed] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">在一起日期</p>
              <p className="mt-2 font-semibold">
                {data.couple.startedAt
                  ? format(new Date(data.couple.startedAt), "yyyy-MM-dd")
                  : "未设置"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#123f44] p-5 text-white">
          <div className="flex items-center justify-between">
            <CalendarHeart className="size-6 text-[#f7c75d]" />
            <Badge tone="gold">愿望</Badge>
          </div>
          <p className="mt-8 text-sm text-[#cce0df]">共同愿望进度</p>
          <p className="mt-2 text-5xl font-semibold">
            {data.wishes.completionPercent}%
          </p>
          <Progress
            className="mt-5 bg-[#2a666b]"
            value={data.wishes.completionPercent}
          />
          <p className="mt-5 text-sm leading-6 text-[#dceff0]">
            共 {data.wishes.items.length} 个愿望，
            {data.wishes.items.filter((w) => w.status === "DONE").length} 个已完成
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/diaries",
            icon: BookHeart,
            title: "写共同日记",
            description: "记录你们的点滴",
            tone: "rose" as const
          },
          {
            href: "/moods",
            icon: Sparkles,
            title: "记录心情",
            description: "今天的感受如何",
            tone: "teal" as const
          },
          {
            href: "/anniversaries",
            icon: CalendarHeart,
            title: "添加纪念日",
            description: "重要的日子不能忘",
            tone: "gold" as const
          },
          {
            href: "/wishes",
            icon: Star,
            title: "愿望清单",
            description: "一起许下心愿",
            tone: "neutral" as const
          }
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              className="group rounded-lg border border-[var(--border)] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9bdb1]"
              href={action.href}
              key={action.title}
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-md bg-[#f7f3ed] text-[var(--primary)]">
                  <Icon className="size-5" />
                </div>
              </div>
              <h3 className="mt-4 font-semibold">{action.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Moods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">最近心情</h2>
                <Badge tone="teal">
                  {data.moodCheckIns.length} 条记录
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {data.moodCheckIns.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                  还没有心情记录
                </p>
              ) : (
                <div className="grid gap-3">
                  {data.moodCheckIns.slice(0, 4).map((mood) => (
                    <div
                      className="rounded-md border border-[var(--border)] p-4"
                      key={mood.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{mood.user.name}</p>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            {mood.mood}
                          </p>
                        </div>
                        <Badge tone={getEnergyTone(mood.energy)}>
                          {mood.energy === "HIGH"
                            ? "精力充沛"
                            : mood.energy === "LOW"
                              ? "需要休息"
                              : "状态平稳"}
                        </Badge>
                      </div>
                      {mood.carePreference ? (
                        <p className="mt-3 rounded-md bg-[#f7f3ed] p-3 text-sm">
                          {mood.carePreference}
                        </p>
                      ) : null}
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
                <Link href="/wishes">
                  <Button size="sm" variant="outline">
                    查看全部
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.wishes.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                  还没有愿望，去添加一个吧
                </p>
              ) : (
                <div className="space-y-4">
                  {data.wishes.items.slice(0, 5).map((wish) => (
                    <div key={wish.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{wish.title}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {wish.category}
                          </p>
                        </div>
                        <Badge tone={getStatusTone(wish.status)}>
                          {wish.status === "DONE"
                            ? "已完成"
                            : wish.status === "PLANNED"
                              ? "进行中"
                              : wish.status === "PAUSED"
                                ? "暂停"
                                : "灵感"}
                        </Badge>
                      </div>
                      <Progress value={wish.completionPercent} />
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

          {/* Recent Diaries */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">最近日记</h2>
            </CardHeader>
            <CardContent>
              {data.diaryEntries.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                  还没有日记
                </p>
              ) : (
                <div className="space-y-3">
                  {data.diaryEntries.slice(0, 3).map((diary) => (
                    <div className="flex gap-3" key={diary.id}>
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-[#f7f3ed] text-[var(--secondary)]">
                        <BookHeart className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{diary.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {diary.author.name} ·{" "}
                          {format(new Date(diary.happenedAt), "MM月dd日")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
