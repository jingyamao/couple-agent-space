"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        if (err.code === "INVALID_CREDENTIALS") {
          setError("邮箱或密码不正确");
        } else {
          setError(err.message);
        }
      } else {
        setError("登录失败，请稍后再试");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-[var(--primary)] text-white">
            <Heart className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Couple Agent Space</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              登录你的账号
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-md bg-[#fff0f2] p-3 text-sm text-[var(--primary)]">
              {error}
            </div>
          ) : null}

          <Input
            label="邮箱"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            type="email"
            value={email}
          />

          <Input
            label="密码"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            required
            type="password"
            value={password}
          />

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "登录"
            )}
          </Button>

          <p className="text-center text-sm text-[var(--muted-foreground)]">
            还没有账号？{" "}
            <Link
              className="font-medium text-[var(--primary)] hover:underline"
              href="/register"
            >
              立即注册
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
