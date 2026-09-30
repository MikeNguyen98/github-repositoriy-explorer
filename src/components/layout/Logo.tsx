import { Link } from "react-router";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-g)" />
      <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="11" cy="9" r="2.6" />
        <circle cx="11" cy="23" r="2.6" />
        <circle cx="21" cy="13" r="2.6" />
        <path d="M11 11.6v8.8M21 15.6c0 3.4-4 3.4-8 5.4" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <LogoMark />
      <span className="hidden sm:inline">Repo Explorer</span>
    </Link>
  );
}
