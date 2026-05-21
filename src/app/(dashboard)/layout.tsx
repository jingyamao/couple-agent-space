"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookHeart, CalendarHeart, Heart, Home, LogOut, Palette, Settings, Sparkles, Star
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCouple, CoupleProvider } from "@/hooks/use-couple";
import { useTheme } from "@/hooks/use-theme";
import { CoupleSetup } from "@/components/couple/couple-setup";
import { Button } from "@/components/ui/button";
import { GoldenRetriever } from "@/components/dogs/golden-retriever";
import { WhitePuppy } from "@/components/dogs/white-puppy";
import { FloatingPaws } from "@/components/dogs/decorations";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { couple, isLoading: coupleLoading } = useCouple();
  const { toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div style={{ animation: "gentle-bounce 1.5s ease-in-out infinite" }}>
            <GoldenRetriever size={100} />
          </div>
          <p className="mt-4 text-[var(--muted-foreground)]">加载中...</p>
        </div>
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
    { href: "/wishes", label: "愿望", icon: Star }
  ];

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="relative min-h-screen">
      <FloatingPaws />

      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md">
                <Heart className="size-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5" style={{ animation: "gentle-bounce 3s ease-in-out infinite" }}>
                <svg height="12" viewBox="0 0 24 24" width="12" fill="var(--secondary)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Couple Agent Space</p>
              <h1 className="text-sm font-bold">{couple.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 小狗标识 */}
            <div className="mr-1 hidden items-center gap-0.5 sm:flex">
              <GoldenRetriever size={28} />
              <WhitePuppy size={24} />
            </div>

            {/* 主题切换 */}
            <Button onClick={toggleTheme} size="icon" variant="ghost" title="切换主题">
              <Palette className="size-4" />
            </Button>

            <Link href="/settings">
              <Button size="icon" variant="ghost"><Settings className="size-4" /></Button>
            </Link>
            <Button onClick={handleLogout} size="icon" variant="ghost"><LogOut className="size-4" /></Button>
          </div>
        </div>
      </header>

      {/* 导航标签 */}
      <nav className="glass-strong sticky top-[57px] z-30 border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {children}
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
