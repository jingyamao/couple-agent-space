export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-[420px]">{children}</div>
    </div>
  );
}
