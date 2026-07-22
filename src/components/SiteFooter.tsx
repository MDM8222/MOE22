import { brand } from "@/lib/brand";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-paper-line bg-paper-soft/60">
      <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Logo />
          <p className="text-sm text-ink-600">{brand.positioning}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a
            href={brand.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-700 hover:text-signal"
          >
            streamlineconnex.com
          </a>
          <a
            href={brand.auditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-700 hover:text-signal"
          >
            Request an outbound audit
          </a>
          <span className="text-ink-600">
            © {new Date().getFullYear()} {brand.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
