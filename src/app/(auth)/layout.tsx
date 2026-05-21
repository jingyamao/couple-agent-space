import { GoldenRetriever } from "@/components/dogs/golden-retriever";
import { WhitePuppy } from "@/components/dogs/white-puppy";
import { FloatingPaws } from "@/components/dogs/decorations";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <FloatingPaws />

      {/* 装饰性线条小狗 */}
      <div className="pointer-events-none absolute bottom-4 left-4 opacity-20 sm:bottom-8 sm:left-8">
        <GoldenRetriever size={160} />
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 opacity-20 sm:bottom-8 sm:right-8">
        <WhitePuppy size={140} />
      </div>

      {/* 装饰性爱心 */}
      <div className="pointer-events-none absolute left-1/4 top-12 opacity-10" style={{ animation: "gentle-bounce 3s ease-in-out infinite" }}>
        <svg height="30" viewBox="0 0 24 24" width="30" fill="var(--heart-pink)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <div className="pointer-events-none absolute right-1/3 top-20 opacity-10" style={{ animation: "gentle-bounce 4s ease-in-out 1s infinite" }}>
        <svg height="20" viewBox="0 0 24 24" width="20" fill="var(--secondary)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
