// MS PICK 로고: 체크 표시 아이콘 + 글자. MS = My Selection
export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="mspick-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a7dff" />
          <stop offset="1" stopColor="#4a34d6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#mspick-g)" />
      <path d="M18 33.5l9 9 19-21" fill="none" stroke="#3ee0b0" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = 'md' }) {
  const text = size === 'lg' ? 'text-3xl' : 'text-lg';
  return (
    <span className="flex items-center gap-2">
      <LogoMark className={size === 'lg' ? 'h-11 w-11' : 'h-8 w-8'} />
      <span className={`${text} font-black tracking-tight`}>
        <span className="text-slate-900 dark:text-white">MS</span>{' '}
        <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-brand-300 dark:to-brand-500">
          PICK
        </span>
      </span>
    </span>
  );
}
