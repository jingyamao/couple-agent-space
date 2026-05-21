type DogProps = {
  className?: string;
  size?: number;
};

export function GoldenRetriever({ className = "", size = 120 }: DogProps) {
  return (
    <svg
      className={className}
      height={size}
      viewBox="0 0 200 200"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身体 */}
      <ellipse cx="100" cy="135" rx="45" ry="40" fill="var(--dog-golden)" stroke="var(--dog-golden-dark)" strokeWidth="2.5" />

      {/* 头 */}
      <circle cx="100" cy="75" r="38" fill="var(--dog-golden)" stroke="var(--dog-golden-dark)" strokeWidth="2.5" />

      {/* 左耳 */}
      <ellipse cx="68" cy="55" rx="18" ry="28" fill="var(--dog-golden-dark)" stroke="var(--dog-golden-dark)" strokeWidth="2" transform="rotate(-15 68 55)" opacity="0.7" />
      {/* 右耳 */}
      <ellipse cx="132" cy="55" rx="18" ry="28" fill="var(--dog-golden-dark)" stroke="var(--dog-golden-dark)" strokeWidth="2" transform="rotate(15 132 55)" opacity="0.7" />

      {/* 脸部毛发 */}
      <path d="M 75 70 Q 85 90 100 88 Q 115 90 125 70" fill="#ffe082" stroke="var(--dog-golden-dark)" strokeWidth="1.5" />

      {/* 左眼 */}
      <circle cx="85" cy="72" r="5" fill="var(--dog-nose)" />
      <circle cx="87" cy="70" r="1.8" fill="white" />
      {/* 右眼 */}
      <circle cx="115" cy="72" r="5" fill="var(--dog-nose)" />
      <circle cx="117" cy="70" r="1.8" fill="white" />

      {/* 鼻子 */}
      <ellipse cx="100" cy="82" rx="7" ry="5.5" fill="var(--dog-nose)" />
      <ellipse cx="100" cy="80.5" rx="3" ry="1.5" fill="#555" opacity="0.4" />

      {/* 嘴巴 */}
      <path d="M 100 87.5 Q 95 94 90 93" fill="none" stroke="var(--dog-nose)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 100 87.5 Q 105 94 110 93" fill="none" stroke="var(--dog-nose)" strokeWidth="1.5" strokeLinecap="round" />

      {/* 腮红 */}
      <ellipse cx="73" cy="82" rx="8" ry="5" fill="var(--dog-cheek)" opacity="0.5" />
      <ellipse cx="127" cy="82" rx="8" ry="5" fill="var(--dog-cheek)" opacity="0.5" />

      {/* 前左脚 */}
      <ellipse cx="80" cy="170" rx="14" ry="10" fill="var(--dog-golden)" stroke="var(--dog-golden-dark)" strokeWidth="2" />
      {/* 前右脚 */}
      <ellipse cx="120" cy="170" rx="14" ry="10" fill="var(--dog-golden)" stroke="var(--dog-golden-dark)" strokeWidth="2" />

      {/* 尾巴 */}
      <path d="M 145 125 Q 165 105 158 85" fill="none" stroke="var(--dog-golden-dark)" strokeWidth="8" strokeLinecap="round" />
      <path d="M 145 125 Q 165 105 158 85" fill="none" stroke="var(--dog-golden)" strokeWidth="5" strokeLinecap="round" />

      {/* 舌头 */}
      <path d="M 103 92 Q 105 100 102 105 Q 99 100 101 92" fill="#ff8a9e" stroke="#e06080" strokeWidth="0.8" />
    </svg>
  );
}
