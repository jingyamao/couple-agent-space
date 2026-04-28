"use client";

import {
  Bell,
  CalendarHeart,
  ChevronRight,
  Heart,
  Plus,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { AgentPanel } from "@/components/dashboard/agent-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  coupleSnapshot,
  moodCards,
  quickActions,
  timeline,
  wishList
} from "@/data/dashboard";

export function CoupleDashboard() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[rgba(251,250,248,0.86)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-[var(--primary)] text-white">
              <Heart className="size-5" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Couple Agent Space
              </p>
              <h1 className="text-lg font-semibold">{coupleSnapshot.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button aria-label="通知" size="icon" variant="outline">
              <Bell className="size-4" />
            </Button>
            <Button>
              <Plus className="size-4" />
              快速记录
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <section className="space-y-6">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm sm:grid-cols-[1.1fr_0.9fr]"
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
          >
            <div>
              <Badge tone="rose">已在一起 {coupleSnapshot.daysTogether} 天</Badge>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-normal text-[#24201c] sm:text-4xl">
                今天也把关系照顾得轻一点、稳一点。
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-[#f7f3ed] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    下一纪念日
                  </p>
                  <p className="mt-2 font-semibold">
                    {coupleSnapshot.nextAnniversary}
                  </p>
                </div>
                <div className="rounded-md bg-[#f7f3ed] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    倒计时
                  </p>
                  <p className="mt-2 font-semibold">
                    {coupleSnapshot.nextAnniversaryInDays} 天
                  </p>
                </div>
                <div className="rounded-md bg-[#f7f3ed] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    城市
                  </p>
                  <p className="mt-2 font-semibold">{coupleSnapshot.city}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[#123f44] p-5 text-white">
              <div className="flex items-center justify-between">
                <CalendarHeart className="size-6 text-[#f7c75d]" />
                <Badge tone="gold">本周</Badge>
              </div>
              <p className="mt-8 text-sm text-[#cce0df]">共同愿望进度</p>
              <p className="mt-2 text-5xl font-semibold">
                {coupleSnapshot.wishProgress}%
              </p>
              <Progress
                className="mt-5 bg-[#2a666b]"
                value={coupleSnapshot.wishProgress}
              />
              <p className="mt-5 text-sm leading-6 text-[#dceff0]">
                本周适合完成一个低成本、小确定性的约定。
              </p>
            </div>
          </motion.section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  className="group rounded-lg border border-[var(--border)] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9bdb1]"
                  key={action.title}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-md bg-[#f7f3ed] text-[var(--primary)]">
                      <Icon className="size-5" />
                    </div>
                    <ChevronRight className="size-4 text-[#9a9187] transition group-hover:translate-x-0.5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{action.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">今日心情</h2>
                <Badge tone="teal">已同步</Badge>
              </div>
              <div className="mt-4 grid gap-3">
                {moodCards.map((item) => (
                  <div
                    className="rounded-md border border-[var(--border)] p-4"
                    key={item.name}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {item.mood}
                        </p>
                      </div>
                      <Badge tone={item.tone}>{item.energy}</Badge>
                    </div>
                    <p className="mt-4 rounded-md bg-[#f7f3ed] p-3 text-sm">
                      {item.care}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">愿望清单</h2>
                <Button size="sm" variant="outline">
                  <Plus className="size-4" />
                  添加
                </Button>
              </div>
              <div className="mt-5 space-y-4">
                {wishList.map((wish) => (
                  <div key={wish.title}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{wish.title}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {wish.category}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {wish.progress}%
                      </span>
                    </div>
                    <Progress value={wish.progress} />
                  </div>
                ))}
              </div>
            </section>
          </section>
        </section>

        <aside className="space-y-6">
          <AgentPanel />

          <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">最近动态</h2>
              <ShieldCheck className="size-5 text-[var(--secondary)]" />
            </div>
            <div className="mt-5 space-y-4">
              {timeline.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="flex gap-3" key={item.title}>
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-[#f7f3ed] text-[var(--secondary)]">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {item.meta}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
