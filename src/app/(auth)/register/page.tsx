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

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 8) {
      setError("密码至少需要 8 个字符");
      return;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("密码需包含大写字母、小写字母和数字");
      return;
    }

    setIsLoading(true);

    try {
      await register(email, name, password);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_ALREADY_EXISTS") {
          setError("该邮箱已被注册");
        } else if (err.code === "VALIDATION_ERROR" && err.detail) {
          const detail = err.detail as { fieldErrors?: Record<string, string[]> };
          const messages = Object.values(detail.fieldErrors ?? {}).flat();
          setError(messages.length > 0 ? messages[0] : err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("注册失败，请稍后再试");
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
              创建新账号
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
            label="姓名"
            name="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字"
            required
            value={name}
          />

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
            placeholder="至少 8 位，包含大小写字母和数字"
            required
            type="password"
            value={password}
          />

          <Input
            label="确认密码"
            name="confirmPassword"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入密码"
            required
            type="password"
            value={confirmPassword}
          />

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "注册"
            )}
          </Button>

          <p className="text-center text-sm text-[var(--muted-foreground)]">
            已有账号？{" "}
            <Link
              className="font-medium text-[var(--primary)] hover:underline"
              href="/login"
            >
              立即登录
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
