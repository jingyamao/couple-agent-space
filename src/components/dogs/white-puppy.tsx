type DogProps = {
  className?: string;
  size?: number;
};

export function WhitePuppy({ className = "", size = 120 }: DogProps) {
  return (
    <svg
      className={className}
      height={size}
      viewBox="0 0 200 200"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身体 */}
      <ellipse cx="100" cy="135" rx="42" ry="38" fill="var(--dog-white)" stroke="#d0c8c0" strokeWidth="2.5" />

      {/* 头 */}
      <circle cx="100" cy="75" r="36" fill="var(--dog-white)" stroke="#d0c8c0" strokeWidth="2.5" />

      {/* 左耳 - 垂耳 */}
      <ellipse cx="70" cy="58" rx="15" ry="25" fill="#f0e8e0" stroke="#d0c8c0" strokeWidth="2" transform="rotate(-10 70 58)" />
      {/* 右耳 - 垂耳 */}
      <ellipse cx="130" cy="58" rx="15" ry="25" fill="#f0e8e0" stroke="#d0c8c0" strokeWidth="2" transform="rotate(10 130 58)" />

      {/* 头顶蝴蝶结 */}
      <g transform="translate(120, 42)">
        <path d="M 0 0 Q -10 -10 -5 -18 Q 2 -12 0 0" fill="var(--secondary)" stroke="var(--secondary-dark)" strokeWidth="1" />
        <path d="M 0 0 Q 10 -10 5 -18 Q -2 -12 0 0" fill="var(--secondary)" stroke="var(--secondary-dark)" strokeWidth="1" />
        <circle cx="0" cy="-2" r="2.5" fill="var(--secondary-dark)" />
      </g>

      {/* 脸部白色毛发 */}
      <path d="M 78 68 Q 88 85 100 83 Q 112 85 122 68" fill="white" stroke="#d0c8c0" strokeWidth="1" />

      {/* 左眼 */}
      <circle cx="86" cy="72" r="4.5" fill="var(--dog-nose)" />
      <circle cx="88" cy="70.5" r="1.5" fill="white" />
      {/* 右眼 */}
      <circle cx="114" cy="72" r="4.5" fill="var(--dog-nose)" />
      <circle cx="116" cy="70.5" r="1.5" fill="white" />

      {/* 鼻子 */}
      <ellipse cx="100" cy="81" rx="6" ry="4.5" fill="var(--dog-nose)" />
      <ellipse cx="100" cy="79.5" rx="2.5" ry="1.2" fill="#555" opacity="0.3" />

      {/* 嘴巴 */}
      <path d="M 100 85.5 Q 96 91 92 90" fill="none" stroke="#b0a8a0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 100 85.5 Q 104 91 108 90" fill="none" stroke="#b0a8a0" strokeWidth="1.5" strokeLinecap="round" />

      {/* 腮红 */}
      <ellipse cx="75" cy="80" rx="7" ry="4.5" fill="var(--dog-cheek)" opacity="0.5" />
      <ellipse cx="125" cy="80" rx="7" ry="4.5" fill="var(--dog-cheek)" opacity="0.5" />

      {/* 前左脚 */}
      <ellipse cx="82" cy="168" rx="13" ry="9" fill="var(--dog-white)" stroke="#d0c8c0" strokeWidth="2" />
      {/* 前右脚 */}
      <ellipse cx="118" cy="168" rx="13" ry="9" fill="var(--dog-white)" stroke="#d0c8c0" strokeWidth="2" />

      {/* 尾巴 - 短而翘 */}
      <path d="M 142 128 Q 158 118 152 102" fill="none" stroke="#d0c8c0" strokeWidth="7" strokeLinecap="round" />
      <path d="M 142 128 Q 158 118 152 102" fill="none" stroke="var(--dog-white)" strokeWidth="4" strokeLinecap="round" />

      {/* 小裙子装饰 */}
      <path d="M 65 130 Q 80 145 100 145 Q 120 145 135 130" fill="none" stroke="var(--secondary-light)" strokeWidth="2" strokeDasharray="4 3" />
    </svg>
  );
}
