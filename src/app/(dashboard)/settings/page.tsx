"use client";

import { useState } from "react";
import { Copy, Loader2, Palette, Users } from "lucide-react";
import { useCouple } from "@/hooks/use-couple";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoldenRetriever } from "@/components/dogs/golden-retriever";
import { WhitePuppy } from "@/components/dogs/white-puppy";

export default function SettingsPage() {
  const { couple } = useCouple();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function copyCode() {
    if (!couple) return;
    navigator.clipboard.writeText(couple.inviteCode);
    setCopied(true);
    toast("success", "邀请码已复制");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!couple) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 主题切换 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Palette className="size-5 text-[var(--primary)]" /><h2 className="text-lg font-semibold">主题设置</h2></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`glass rounded-2xl p-4 text-center transition-all duration-200 ${theme === "blue" ? "ring-2 ring-[var(--primary)]" : ""}`}
                onClick={() => setTheme("blue")}
                type="button"
              >
                <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#5b9bd5] to-[#3a7cb8]">
                  <GoldenRetriever size={32} />
                </div>
                <p className="text-sm font-semibold">清新蓝</p>
                <p className="text-xs text-[var(--muted-foreground)]">清爽自然</p>
              </button>
              <button
                className={`glass rounded-2xl p-4 text-center transition-all duration-200 ${theme === "pink" ? "ring-2 ring-[var(--primary)]" : ""}`}
                onClick={() => setTheme("pink")}
                type="button"
              >
                <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#e88ca5] to-[#d06a85]">
                  <WhitePuppy size={32} />
                </div>
                <p className="text-sm font-semibold">樱花粉</p>
                <p className="text-xs text-[var(--muted-foreground)]">温柔浪漫</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 邀请码 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><Users className="size-5 text-[var(--primary)]" /><h2 className="text-lg font-semibold">邀请码</h2></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">分享邀请码给对方，让 TA 加入你们的空间</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-2xl bg-[var(--surface)] px-4 py-3 text-center text-lg font-mono font-bold tracking-widest backdrop-blur-sm">{couple.inviteCode}</code>
              <Button onClick={copyCode} variant="outline"><Copy className="size-4" /> {copied ? "已复制" : "复制"}</Button>
            </div>
          </CardContent>
        </Card>

        {/* 成员 */}
        <Card className="lg:col-span-2">
          <CardHeader><h2 className="text-lg font-semibold">成员</h2></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {couple.members.map((m) => (
                <div className="glass flex items-center gap-3 rounded-2xl p-4" key={m.id}>
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-sm font-bold text-white">{m.user.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold">{m.user.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{m.user.email}</p>
                  </div>
                  <Badge className="ml-auto" tone={m.role === "OWNER" ? "rose" : "teal"}>{m.role === "OWNER" ? "创建者" : "伴侣"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
