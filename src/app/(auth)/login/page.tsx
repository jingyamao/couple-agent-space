"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
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
    e.preventDefault(); setError(""); setIsLoading(true);
    try { await login(email, password); router.push("/"); }
    catch (err) {
      if (err instanceof ApiClientError) setError(err.code === "INVALID_CREDENTIALS" ? "邮箱或密码不正确" : err.message);
      else setError("登录失败，请稍后再试");
    } finally { setIsLoading(false); }
  }

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)]">
              <Heart className="size-8 text-white" />
            </div>
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold tracking-wide">Couple Agent Space</h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]" style={{ fontFamily: "var(--font-serif)" }}>欢迎回来</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="rounded-2xl bg-[var(--danger-bg)] p-3 text-center text-sm text-[var(--danger)]">{error}</div>}
            <Input label="邮箱" name="email" onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required type="email" value={email} />
            <Input label="密码" name="password" onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" required type="password" value={password} />
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "登录"}
            </Button>
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              还没有账号？{" "}
              <Link className="font-semibold text-[var(--primary-dark)] transition-colors hover:text-[var(--primary)]" href="/register">立即注册</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
