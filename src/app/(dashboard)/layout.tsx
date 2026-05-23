"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookHeart, CalendarHeart, Heart, Home, LogOut, Palette, Settings, Sparkles, Star, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useCouple, CoupleProvider } from "@/hooks/use-couple";
import { useTheme } from "@/hooks/use-theme";
import { CoupleSetup } from "@/components/couple/couple-setup";
import { Button } from "@/components/ui/button";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { couple, isLoading: coupleLoading } = useCouple();
  const { toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Heart className="size-12 text-[var(--primary)]" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;
  if (!couple) return <CoupleSetup />;

  const navItems = [
    { href: "/dashboard", label: "首页", icon: Home },
    { href: "/diaries", label: "日记", icon: BookHeart },
    { href: "/moods", label: "心情", icon: Sparkles },
    { href: "/anniversaries", label: "纪念日", icon: CalendarHeart },
    { href: "/wishes", label: "愿望", icon: Star },
    { href: "/settings", label: "设置", icon: Settings }
  ];

  async function handleLogout() { await logout(); router.push("/login"); }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar (>=1024px) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="glass flex h-full flex-col rounded-r-3xl p-5">
          {/* Couple Info */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-lg font-bold text-white">
                  {couple.members[0]?.user.name.charAt(0) ?? "?"}
                </div>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[var(--primary)]"
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="size-2.5 text-white" />
                </motion.div>
              </div>
              {couple.members[1] && (
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary-light)] to-[var(--secondary)] text-lg font-bold text-white">
                  {couple.members[1].user.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>{couple.title}</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {couple.members.map((m) => m.user.name).join(" & ")}
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--nav-active)] text-[var(--primary-dark)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <Button className="w-full justify-start gap-3" onClick={toggleTheme} variant="ghost">
              <Palette className="size-5" /> 切换主题
            </Button>
            <Button className="w-full justify-start gap-3" onClick={handleLogout} variant="ghost">
              <LogOut className="size-5" /> 退出登录
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden lg:hidden">
        <div className="glass mx-2 mb-2 flex items-center justify-around rounded-2xl px-1 py-2 sm:mx-3 sm:mb-3 sm:px-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs transition-all ${
                  isActive ? "text-[var(--primary-dark)]" : "text-[var(--muted-foreground)]"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className="mt-0.5 h-0.5 w-4 rounded-full bg-[var(--primary)]"
                    layoutId="bottomNav"
                  />
                )}
              </Link>
            );
          })}
          <button
            className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs text-[var(--muted-foreground)]"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <Settings className="size-5" />
            <span>更多</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              animate={{ x: 0 }}
              className="fixed inset-y-0 right-0 z-50 w-72 lg:hidden"
              exit={{ x: "100%" }}
              initial={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="glass flex h-full flex-col p-5">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>菜单</h2>
                  <Button onClick={() => setSidebarOpen(false)} size="icon" variant="ghost"><X className="size-5" /></Button>
                </div>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-lg font-bold text-white">
                    {couple.members[0]?.user.name.charAt(0) ?? "?"}
                  </div>
                  {couple.members[1] && (
                    <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary-light)] to-[var(--secondary)] text-lg font-bold text-white">
                      {couple.members[1].user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mb-6 text-sm text-[var(--muted-foreground)]">{couple.title}</p>

                <nav className="flex-1 space-y-1">
                  <Link className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface)]" href="/settings" onClick={() => setSidebarOpen(false)}>
                    <Settings className="size-5" /> 设置
                  </Link>
                </nav>

                <div className="space-y-2 border-t border-[var(--border)] pt-4">
                  <Button className="w-full justify-start gap-3" onClick={() => { toggleTheme(); setSidebarOpen(false); }} variant="ghost">
                    <Palette className="size-5" /> 切换主题
                  </Button>
                  <Button className="w-full justify-start gap-3" onClick={handleLogout} variant="ghost">
                    <LogOut className="size-5" /> 退出登录
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-w-0 flex-1 lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CoupleProvider>
      <DashboardShell>{children}</DashboardShell>
    </CoupleProvider>
  );
}
