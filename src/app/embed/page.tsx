import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { SignalMark } from "@/components/Logo";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.productName} — embed`,
  robots: { index: false, follow: false },
};

/**
 * Embed-friendly version of the lead form for iframing into the main
 * streamlineconnex.com marketing site (or any landing page):
 *
 *   <iframe src="https://<your-deploy>/embed"
 *           style="width:100%;max-width:560px;height:540px;border:0"
 *           title="Buyer Signal Map"></iframe>
 *
 * No site header/footer/nav — just the form with a compact heading. On success
 * the parent tab navigates to the full report page.
 */
export default function EmbedPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-4 flex items-center gap-2.5">
        <SignalMark className="h-5 w-5 text-signal" />
        <p className="text-sm font-semibold tracking-tight text-ink">
          {brand.productName}
        </p>
      </div>
      <p className="mb-5 text-[15px] leading-relaxed text-ink-700">
        Enter your website and see 5–8 places your ideal customers are showing
        buying signals right now.
      </p>
      <LeadForm embed />
    </main>
  );
}
