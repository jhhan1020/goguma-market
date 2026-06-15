export default function GogumaCharacter({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 몸통 그림자 */}
      <ellipse cx="60" cy="105" rx="30" ry="7" fill="#7c3aed" opacity="0.12" />

      {/* 잎사귀 줄기 */}
      <path d="M60 18 Q55 8 48 10 Q52 15 55 20" fill="#4ade80" />
      <path d="M60 18 Q65 6 73 9 Q68 14 63 19" fill="#22c55e" />
      <path d="M60 18 Q60 5 60 12" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />

      {/* 몸통 - 고구마 자주빛 보라 */}
      <ellipse cx="60" cy="68" rx="32" ry="38" fill="#7c3aed" />
      {/* 몸통 하이라이트 */}
      <ellipse cx="60" cy="68" rx="32" ry="38" fill="url(#bodyGrad)" />

      {/* 볼터치 - 따뜻한 주황 */}
      <ellipse cx="40" cy="72" rx="8" ry="5" fill="#f59e0b" opacity="0.45" />
      <ellipse cx="80" cy="72" rx="8" ry="5" fill="#f59e0b" opacity="0.45" />

      {/* 눈 흰자 */}
      <ellipse cx="50" cy="60" rx="8" ry="9" fill="white" />
      <ellipse cx="70" cy="60" rx="8" ry="9" fill="white" />

      {/* 눈동자 */}
      <ellipse cx="52" cy="62" rx="5" ry="6" fill="#1a1a1a" />
      <ellipse cx="72" cy="62" rx="5" ry="6" fill="#1a1a1a" />

      {/* 눈 하이라이트 */}
      <circle cx="54" cy="59" r="1.8" fill="white" />
      <circle cx="74" cy="59" r="1.8" fill="white" />

      {/* 입 */}
      <path
        d="M52 76 Q60 83 68 76"
        stroke="#5b21b6"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 팔 왼쪽 */}
      <ellipse cx="25" cy="72" rx="8" ry="5" fill="#6d28d9" transform="rotate(-20 25 72)" />
      {/* 팔 오른쪽 */}
      <ellipse cx="95" cy="72" rx="8" ry="5" fill="#6d28d9" transform="rotate(20 95 72)" />

      {/* 그라디언트 정의 */}
      <defs>
        <radialGradient id="bodyGrad" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.4" />
        </radialGradient>
      </defs>
    </svg>
  )
}
