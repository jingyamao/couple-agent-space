"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldenRetriever } from "@/components/dogs/golden-retriever";
import { HeartIcon } from "@/components/dogs/decorations";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.code === "INVALID_CREDENTIALS" ? "邮箱或密码不正确" : err.message);
      } else {
        setError("登录失败，请稍后再试");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center pb-0">
        <div className="relative">
          <GoldenRetriever size={80} className="mx-auto" />
          <div className="absolute -right-1 -top-1" style={{ animation: "gentle-bounce 2s ease-in-out infinite" }}>
            <HeartIcon size={18} />
          </div>
        </div>
        <h1 className="mt-3 text-xl font-bold">Couple Agent Space</h1>
        <p className="text-sm text-[var(--muted-foreground)]">欢迎回来，登录你的账号</p>
      </CardHeader>
      <CardContent>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-xl bg-[rgba(240,112,112,0.1)] p-3 text-center text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          <Input label="邮箱" name="email" onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required type="email" value={email} />
          <Input label="密码" name="password" onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" required type="password" value={password} />

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : "登录"}
          </Button>

          <p className="text-center text-sm text-[var(--muted-foreground)]">
            还没有账号？{" "}
            <Link className="font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]" href="/register">
              立即注册
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
