"use client";

import { useState } from "react";
import { Copy, Loader2, Settings, Users } from "lucide-react";
import { useCouple } from "@/hooks/use-couple";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { couple } = useCouple();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function copyInviteCode() {
    if (!couple) return;
    navigator.clipboard.writeText(couple.inviteCode);
    setCopied(true);
    toast("success", "邀请码已复制");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!couple) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">设置</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Couple Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-[var(--secondary)]" />
              <h2 className="text-lg font-semibold">空间信息</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">空间名称</p>
              <p className="mt-1 font-medium">{couple.title}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">在一起日期</p>
              <p className="mt-1 font-medium">
                {couple.startedAt
                  ? new Date(couple.startedAt).toLocaleDateString("zh-CN")
                  : "未设置"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Invite Code */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-[var(--secondary)]" />
              <h2 className="text-lg font-semibold">邀请码</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              分享邀请码给对方，让 TA 加入你们的空间
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-md bg-[#f7f3ed] px-4 py-3 text-center text-lg font-mono font-semibold tracking-widest">
                {couple.inviteCode}
              </code>
              <Button onClick={copyInviteCode} variant="outline">
                <Copy className="size-4" />
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold">成员</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {couple.members.map((member) => (
                <div
                  className="flex items-center gap-3 rounded-md border border-[var(--border)] p-4"
                  key={member.id}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#f7f3ed] text-[var(--primary)]">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {member.user.email}
                    </p>
                  </div>
                  <Badge
                    className="ml-auto"
                    tone={member.role === "OWNER" ? "rose" : "teal"}
                  >
                    {member.role === "OWNER" ? "创建者" : "伴侣"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
