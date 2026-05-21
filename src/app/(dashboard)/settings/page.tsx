"use client";

import { useState } from "react";
import { Copy, Heart, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useCouple } from "@/hooks/use-couple";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { couple } = useCouple(); const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function copyCode() {
    if (!couple) return;
    navigator.clipboard.writeText(couple.inviteCode);
    setCopied(true); toast("success", "邀请码已复制");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!couple) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" /></div>;

  const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>设置</h1>

      {/* Couple Profile */}
      <motion.div {...fade} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--primary-light)] via-transparent to-[var(--secondary-light)] p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-xl font-bold text-white">
                  {couple.members[0]?.user.name.charAt(0) ?? "?"}
                </div>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Heart className="size-6 text-[var(--primary)]" fill="var(--primary)" />
                </motion.div>
                {couple.members[1] && (
                  <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary-light)] to-[var(--secondary)] text-xl font-bold text-white">
                    {couple.members[1].user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>{couple.title}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{couple.members.map((m) => m.user.name).join(" & ")}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invite Code */}
        <motion.div {...fade} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2"><Users className="size-5 text-[var(--primary)]" /><h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>邀请码</h2></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">分享邀请码给对方加入空间</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 rounded-2xl bg-[var(--surface)] px-4 py-3 text-center text-lg font-mono font-bold tracking-widest">{couple.inviteCode}</code>
                <Button onClick={copyCode} variant="outline"><Copy className="size-4" /> {copied ? "已复制" : "复制"}</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Members */}
        <motion.div {...fade} transition={{ duration: 0.5, delay: 0.15 }}>
          <Card>
            <CardHeader><h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>成员</h2></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {couple.members.map((m) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4" key={m.id}>
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] text-sm font-bold text-white">{m.user.name.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{m.user.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{m.user.email}</p>
                    </div>
                    <Badge tone={m.role === "OWNER" ? "rose" : "teal"}>{m.role === "OWNER" ? "创建者" : "伴侣"}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
