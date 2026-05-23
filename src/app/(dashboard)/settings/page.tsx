"use client";

import { FormEvent, useState } from "react";
import { Camera, Copy, Heart, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useCouple } from "@/hooks/use-couple";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";

export default function SettingsPage() {
  const { couple } = useCouple();
  const { user, refresh: refreshUser } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");

  function copyCode() {
    if (!couple) return;
    navigator.clipboard.writeText(couple.inviteCode);
    setCopied(true); toast("success", "邀请码已复制");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await apiClient(`/api/users/${user.id}`, {
        method: "PATCH",
        body: { name: name || undefined, avatarUrl: avatarUrl || null }
      });
      await refreshUser();
      toast("success", "资料已更新");
    } catch {
      toast("error", "更新失败");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarSave() {
    if (!user) return;
    setIsSaving(true);
    try {
      await apiClient(`/api/users/${user.id}`, {
        method: "PATCH",
        body: { avatarUrl: avatarUrl || null }
      });
      await refreshUser();
      setAvatarDialogOpen(false);
      toast("success", "头像已更新");
    } catch {
      toast("error", "更新失败");
    } finally {
      setIsSaving(false);
    }
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
                <Avatar name={couple.members[0]?.user.name ?? "?"} size="xl" src={couple.members[0]?.user.avatarUrl} />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Heart className="size-6 text-[var(--primary)]" fill="var(--primary)" />
                </motion.div>
                {couple.members[1] && (
                  <Avatar name={couple.members[1].user.name} size="xl" src={couple.members[1].user.avatarUrl} />
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
        {/* User Profile */}
        <motion.div {...fade} transition={{ duration: 0.5, delay: 0.05 }}>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>个人资料</h2>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div className="flex items-center gap-4">
                  <button
                    className="group relative shrink-0 cursor-pointer"
                    onClick={() => { setAvatarUrl(user?.avatarUrl ?? ""); setAvatarDialogOpen(true); }}
                    type="button"
                  >
                    <Avatar className="ring-2 ring-[var(--border)] transition-all group-hover:ring-[var(--primary)]" name={user?.name ?? "?"} size="xl" src={user?.avatarUrl} />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="size-5 text-white" />
                    </div>
                  </button>
                  <div className="flex-1">
                    <Input label="昵称" name="name" onChange={(e) => setName(e.target.value)} value={name} />
                  </div>
                </div>
                <Button disabled={isSaving} type="submit">
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : "保存资料"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

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
        <motion.div {...fade} className="lg:col-span-2" transition={{ duration: 0.5, delay: 0.15 }}>
          <Card>
            <CardHeader><h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>成员</h2></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {couple.members.map((m) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-4" key={m.id}>
                    <Avatar name={m.user.name} src={m.user.avatarUrl} />
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

      {/* Avatar Upload Dialog */}
      <Dialog onClose={() => setAvatarDialogOpen(false)} open={avatarDialogOpen} title="更换头像">
        <div className="space-y-4 p-5">
          <div className="flex justify-center">
            <ImageUpload
              aspectRatio="square"
              className="size-48"
              onChange={setAvatarUrl}
              prefix="avatars"
              value={avatarUrl}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAvatarDialogOpen(false)} variant="outline">取消</Button>
            <Button disabled={isSaving} onClick={handleAvatarSave}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : "保存头像"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
