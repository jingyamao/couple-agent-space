"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ToastProvider } from "@/components/ui/toast";
import { ClickHearts } from "@/components/ui/click-hearts";
import { FloatingParticles } from "@/components/ui/floating-particles";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FloatingParticles />
          <ClickHearts />
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
