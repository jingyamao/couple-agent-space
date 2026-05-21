"use client";

import { FormEvent, useState } from "react";
import { Heart, Loader2, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useCouple } from "@/hooks/use-couple";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CoupleSetup() {
  const { createCouple, joinCouple } = useCouple();
  const { toast } = useToast();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [title, setTitle] = useState("我们的空间");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault(); setError(""); setIsLoading(true);
    try { await createCouple(title); toast("success", "空间创建成功！"); }
    catch (err) { setError(err instanceof ApiClientError ? err.message : "创建失败"); }
    finally { setIsLoading(false); }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault(); setError(""); setIsLoading(true);
    try { await joinCouple(inviteCode.trim()); toast("success", "成功加入空间！"); }
    catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "INVITE_CODE_NOT_FOUND") setError("邀请码不存在");
        else if (err.code === "COUPLE_FULL") setError("该空间已满");
        else if (err.code === "INVITE_CODE_EXPIRED") setError("邀请码已过期");
        else setError(err.message);
      } else setError("加入失败");
    } finally { setIsLoading(false); }
  }

  const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  if (mode === "create") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="w-full max-w-[420px]">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)]">
                  <Heart className="size-7 text-white" />
                </div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>创建你们的空间</h1>
              </div>
              <form className="space-y-4" onSubmit={handleCreate}>
                {error && <div className="rounded-2xl bg-[rgba(232,128,128,0.08)] p-3 text-center text-sm text-[var(--danger)]">{error}</div>}
                <Input label="空间名称" name="title" onChange={(e) => setTitle(e.target.value)} value={title} />
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={isLoading} type="submit">{isLoading ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> 创建</>}</Button>
                  <Button disabled={isLoading} onClick={() => setMode("choose")} type="button" variant="outline">返回</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="w-full max-w-[420px]">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary-light)] to-[var(--secondary)]">
                  <Users className="size-7 text-white" />
                </div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>加入对方的空间</h1>
              </div>
              <form className="space-y-4" onSubmit={handleJoin}>
                {error && <div className="rounded-2xl bg-[rgba(232,128,128,0.08)] p-3 text-center text-sm text-[var(--danger)]">{error}</div>}
                <Input label="邀请码" name="inviteCode" onChange={(e) => setInviteCode(e.target.value)} placeholder="输入 8 位邀请码" required value={inviteCode} />
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={isLoading} type="submit">{isLoading ? <Loader2 className="size-4 animate-spin" /> : <><Users className="size-4" /> 加入</>}</Button>
                  <Button disabled={isLoading} onClick={() => setMode("choose")} type="button" variant="outline">返回</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] via-[var(--primary)] to-[var(--secondary)]">
            <Heart className="size-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>Couple Agent Space</h1>
          <p className="mt-3 text-[var(--muted-foreground)]" style={{ fontFamily: "var(--font-serif)" }}>创建或加入一个情侣空间</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button className="glass group rounded-3xl p-7 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" onClick={() => setMode("create")} type="button">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(232,160,176,0.1)]"><Plus className="size-7 text-[var(--primary)]" /></div>
            <h2 className="mt-4 text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>创建空间</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">创建一个新的情侣空间</p>
          </button>
          <button className="glass group rounded-3xl p-7 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" onClick={() => setMode("join")} type="button">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(160,196,232,0.1)]"><Users className="size-7 text-[var(--secondary)]" /></div>
            <h2 className="mt-4 text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>加入空间</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">使用邀请码加入已有空间</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
