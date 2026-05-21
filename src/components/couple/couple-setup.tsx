"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus, Users } from "lucide-react";
import { useCouple } from "@/hooks/use-couple";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldenRetriever } from "@/components/dogs/golden-retriever";
import { WhitePuppy } from "@/components/dogs/white-puppy";
import { HeartIcon, FloatingPaws } from "@/components/dogs/decorations";

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
    }
    finally { setIsLoading(false); }
  }

  if (mode === "create") {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <FloatingPaws />
        <Card className="relative z-10 w-full max-w-md">
          <CardHeader className="items-center text-center">
            <GoldenRetriever size={60} />
            <h1 className="mt-2 text-xl font-bold">创建你们的空间</h1>
            <p className="text-sm text-[var(--muted-foreground)]">给专属空间起个名字</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              {error && <div className="rounded-xl bg-[rgba(240,112,112,0.1)] p-3 text-center text-sm text-[var(--danger)]">{error}</div>}
              <Input label="空间名称" name="title" onChange={(e) => setTitle(e.target.value)} value={title} />
              <div className="flex gap-2">
                <Button className="flex-1" disabled={isLoading} type="submit">
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> 创建</>}
                </Button>
                <Button disabled={isLoading} onClick={() => setMode("choose")} type="button" variant="outline">返回</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <FloatingPaws />
        <Card className="relative z-10 w-full max-w-md">
          <CardHeader className="items-center text-center">
            <WhitePuppy size={60} />
            <h1 className="mt-2 text-xl font-bold">加入对方的空间</h1>
            <p className="text-sm text-[var(--muted-foreground)]">输入对方分享的邀请码</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleJoin}>
              {error && <div className="rounded-xl bg-[rgba(240,112,112,0.1)] p-3 text-center text-sm text-[var(--danger)]">{error}</div>}
              <Input label="邀请码" name="inviteCode" onChange={(e) => setInviteCode(e.target.value)} placeholder="输入 8 位邀请码" required value={inviteCode} />
              <div className="flex gap-2">
                <Button className="flex-1" disabled={isLoading} type="submit">
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <><Users className="size-4" /> 加入</>}
                </Button>
                <Button disabled={isLoading} onClick={() => setMode("choose")} type="button" variant="outline">返回</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <FloatingPaws />
      <div className="relative z-10 w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-end justify-center gap-2">
            <div style={{ animation: "gentle-bounce 2s ease-in-out infinite" }}>
              <GoldenRetriever size={90} />
            </div>
            <HeartIcon size={28} className="mb-6" />
            <div style={{ animation: "gentle-bounce 2s ease-in-out 0.5s infinite" }}>
              <WhitePuppy size={80} />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold">欢迎来到 Couple Agent Space</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">创建或加入一个情侣空间，开始你们的协作旅程</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            className="glass group rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02]"
            onClick={() => setMode("create")}
            type="button"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(91,155,213,0.12)] text-[var(--primary)]">
              <Plus className="size-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold">创建空间</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">创建一个新的情侣空间，邀请对方加入</p>
          </button>

          <button
            className="glass group rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02]"
            onClick={() => setMode("join")}
            type="button"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(245,160,177,0.12)] text-[var(--secondary)]">
              <Users className="size-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold">加入空间</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">使用对方分享的邀请码加入已有空间</p>
          </button>
        </div>
      </div>
    </div>
  );
}
