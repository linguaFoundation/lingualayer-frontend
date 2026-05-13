export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="120" height="120" rx="28" fill="rgba(16,32,21,0.92)" />
      <path
        d="M28 72 Q48 28 60 52 Q72 28 92 72"
        stroke="url(#lg)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M38 88 Q60 62 82 88" stroke="#c8f59f" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5ee9a8" />
          <stop offset="100%" stopColor="#c8f59f" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="52" r="10" fill="#5ee9a8" />
    </svg>
  );
}
