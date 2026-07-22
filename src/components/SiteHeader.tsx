import Link from "next/link";
import { brand } from "@/lib/brand";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-paper-line/70 bg-paper/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" aria-label={`${brand.name} home`}>
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-600 sm:inline">
            {brand.productName}
          </span>
          <a
            href={brand.bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !px-4 !py-2 text-[13px]"
          >
            Book a strategy call
          </a>
        </div>
      </div>
    </header>
  );
}
