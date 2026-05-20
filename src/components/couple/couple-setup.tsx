"use client";

import { FormEvent, useState } from "react";
import { Heart, Loader2, Plus, Users } from "lucide-react";
import { useCouple } from "@/hooks/use-couple";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await createCouple(title);
      toast("success", "空间创建成功！");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("创建失败，请稍后再试");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await joinCouple(inviteCode.trim());
      toast("success", "成功加入空间！");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "INVITE_CODE_NOT_FOUND") {
          setError("邀请码不存在");
        } else if (err.code === "COUPLE_FULL") {
          setError("该空间已满");
        } else {
          setError(err.message);
        }
      } else {
        setError("加入失败，请稍后再试");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (mode === "create") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-xl font-semibold">创建你们的空间</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              给你们的专属空间起个名字
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              {error ? (
                <div className="rounded-md bg-[#fff0f2] p-3 text-sm text-[var(--primary)]">
                  {error}
                </div>
              ) : null}

              <Input
                label="空间名称"
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="我们的空间"
                value={title}
              />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="size-4" />
                      创建
                    </>
                  )}
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={() => setMode("choose")}
                  type="button"
                  variant="outline"
                >
                  返回
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-xl font-semibold">加入对方的空间</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              输入对方分享的邀请码
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleJoin}>
              {error ? (
                <div className="rounded-md bg-[#fff0f2] p-3 text-sm text-[var(--primary)]">
                  {error}
                </div>
              ) : null}

              <Input
                label="邀请码"
                name="inviteCode"
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="输入 8 位邀请码"
                required
                value={inviteCode}
              />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Users className="size-4" />
                      加入
                    </>
                  )}
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={() => setMode("choose")}
                  type="button"
                  variant="outline"
                >
                  返回
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--primary)] text-white">
            <Heart className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">欢迎来到 Couple Agent Space</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            创建或加入一个情侣空间，开始你们的协作旅程
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            className="group rounded-lg border border-[var(--border)] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
            onClick={() => setMode("create")}
            type="button"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-[#fff0f2] text-[var(--primary)]">
              <Plus className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">创建空间</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              创建一个新的情侣空间，邀请对方加入
            </p>
          </button>

          <button
            className="group rounded-lg border border-[var(--border)] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--secondary)]"
            onClick={() => setMode("join")}
            type="button"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-[#dceff0] text-[var(--secondary)]">
              <Users className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">加入空间</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              使用对方分享的邀请码加入已有空间
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
