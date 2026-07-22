import { brand } from "@/lib/brand";

/** Compact wordmark with a small signal glyph. Deliberately understated. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <SignalMark className="h-6 w-6 text-signal" />
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        {brand.name}
      </span>
    </span>
  );
}

export function SignalMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="14" width="4" height="7" rx="1" fill="currentColor" opacity="0.45" />
      <rect x="9" y="9" width="4" height="12" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="16" y="3" width="4" height="18" rx="1" fill="currentColor" />
    </svg>
  );
}
