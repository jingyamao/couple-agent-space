export function HeartIcon({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg className={className} height={size} viewBox="0 0 24 24" width={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--heart-pink)" stroke="var(--secondary-dark)" strokeWidth="1" />
    </svg>
  );
}

export function PawIcon({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg className={className} height={size} viewBox="0 0 24 24" width={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="8" cy="8" rx="2.5" ry="3" fill="var(--paw-brown)" />
      <ellipse cx="16" cy="8" rx="2.5" ry="3" fill="var(--paw-brown)" />
      <ellipse cx="5.5" cy="14" rx="2" ry="2.5" fill="var(--paw-brown)" />
      <ellipse cx="18.5" cy="14" rx="2" ry="2.5" fill="var(--paw-brown)" />
      <ellipse cx="12" cy="17" rx="5" ry="4" fill="var(--paw-brown)" />
    </svg>
  );
}

export function BoneIcon({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg className={className} height={size} viewBox="0 0 24 24" width={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="9" width="10" height="6" rx="3" fill="#f5ede0" stroke="var(--paw-brown)" strokeWidth="1.5" />
      <circle cx="6" cy="9" r="3" fill="#f5ede0" stroke="var(--paw-brown)" strokeWidth="1.5" />
      <circle cx="18" cy="9" r="3" fill="#f5ede0" stroke="var(--paw-brown)" strokeWidth="1.5" />
      <circle cx="6" cy="15" r="3" fill="#f5ede0" stroke="var(--paw-brown)" strokeWidth="1.5" />
      <circle cx="18" cy="15" r="3" fill="#f5ede0" stroke="var(--paw-brown)" strokeWidth="1.5" />
    </svg>
  );
}

export function FloatingPaws({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {[...Array(6)].map((_, i) => (
        <div
          className="absolute opacity-[0.07]"
          key={i}
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 30}%`,
            transform: `rotate(${i * 30 - 60}deg)`,
            animation: `paw-walk ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`
          }}
        >
          <PawIcon size={24 + i * 4} />
        </div>
      ))}
    </div>
  );
}
