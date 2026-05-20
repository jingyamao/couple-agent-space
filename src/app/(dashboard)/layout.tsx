"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookHeart,
  CalendarHeart,
  Heart,
  Home,
  LogOut,
  Settings,
  Sparkles,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { CoupleProvider } from "@/hooks/use-couple";
import { CoupleSetup } from "@/components/couple/couple-setup";
import { Button } from "@/components/ui/button";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { couple, isLoading: coupleLoading } = useCouple();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || coupleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Heart className="size-8 animate-pulse text-[var(--primary)]" />
      </div>
    );
  }

  if (!user) return null;

  if (!couple) {
    return <CoupleSetup />;
  }

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
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(251,250,248,0.86)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[var(--primary)] text-white">
              <Heart className="size-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Couple Agent Space
              </p>
              <h1 className="text-sm font-semibold">{couple.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-[var(--muted-foreground)] sm:block">
              {user.name}
            </span>
            <Link href="/settings">
              <Button size="icon" variant="ghost">
                <Settings className="size-4" />
              </Button>
            </Link>
            <Button onClick={handleLogout} size="icon" variant="ghost">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <nav className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[#39332d]"
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <CoupleProvider>
      <DashboardShell>{children}</DashboardShell>
    </CoupleProvider>
  );
}
