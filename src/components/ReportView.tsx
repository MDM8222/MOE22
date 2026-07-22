import type { LeadSubmission } from "@/lib/schema";
import { totalOpportunity } from "@/lib/score";
import { brand } from "@/lib/brand";
import { SignalCard } from "./SignalCard";
import { SignalMark } from "./Logo";

export function ReportView({ submission }: { submission: LeadSubmission }) {
  const { profile, report, meta } = submission;
  const total = totalOpportunity(report);

  return (
    <div className="container-page py-10 sm:py-14">
      {(meta.demo || submission.status === "partial") && (
        <Notices demo={meta.demo} partial={submission.status === "partial"} />
      )}

      {/* Section 1 — How Streamline Connex sees your business */}
      <section className="animate-fade-up">
        <p className="eyebrow">Buyer Signal Map</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
          How {brand.name} sees your business
        </h1>
        <p className="mt-3 text-sm text-ink-600">
          {submission.hostname} · generated{" "}
          {new Date(submission.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <p className="serif text-lg leading-relaxed text-ink-800">
              {report.howWeSeeYourBusiness}
            </p>
            <p className="mt-4 border-l-2 border-signal/40 pl-4 text-[15px] font-medium text-ink-700">
              {report.positioningSummary}
            </p>
          </div>

          <div className="card space-y-4 p-6">
            <ProfileRow label="Company" value={profile.companyName} />
            <ProfileRow label="Category" value={profile.category} />
            <ProfileRow label="Business model" value={profile.businessModel} />
            <ProfileChips label="Industries" values={profile.industriesServed} />
            <ProfileChips label="Buyer roles" values={profile.icpRoles} />
          </div>
        </div>
      </section>

      {/* Section 2 — 5–8 places your future customers are showing buying signals */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <SignalMark className="h-6 w-6 text-signal" />
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              {report.signals.length} places your future customers are showing
              buying signals
            </h2>
          </div>
          <div className="rounded-xl border border-paper-line bg-white px-4 py-2.5 text-sm">
            <span className="text-ink-600">Combined est. opportunity </span>
            <span className="font-semibold text-ink">
              {total.low}–{total.high} / mo
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {report.signals.map((signal, i) => (
            <SignalCard key={`${signal.name}-${i}`} signal={signal} index={i} />
          ))}
        </div>
      </section>

      {/* Section 3 — Summary / next step + CTA */}
      <section className="mt-14">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-12 text-paper sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-signal/90">
            Your outbound thesis
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-paper/90">
            {report.summary}
          </p>
          <p className="mt-6 max-w-3xl text-paper/80">
            {report.recommendedNextStep}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={brand.bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
            >
              Book a strategy call
            </a>
            <a
              href={brand.auditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !border-paper/20 !bg-transparent !text-paper hover:!bg-white/10"
            >
              Request a full outbound audit
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-600">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-medium text-ink-800">{value}</p>
    </div>
  );
}

function ProfileChips({ label, values }: { label: string; values: string[] }) {
  if (!values?.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-600">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.slice(0, 6).map((v) => (
          <span
            key={v}
            className="rounded-full bg-paper-soft px-2.5 py-1 text-xs font-medium text-ink-700"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function Notices({ demo, partial }: { demo: boolean; partial: boolean }) {
  return (
    <div className="mb-8 space-y-3">
      {demo && (
        <div className="rounded-xl border border-amber/30 bg-amber-50 px-4 py-3 text-sm text-amber">
          <strong className="font-semibold">Demo report.</strong> This was
          generated in demo mode. Configure an Anthropic API key to produce a
          live, tailored analysis.
        </div>
      )}
      {partial && (
        <div className="rounded-xl border border-signal/20 bg-signal-50 px-4 py-3 text-sm text-signal-600">
          <strong className="font-semibold">Limited read.</strong> We
          couldn&apos;t fully read your website, so this report is based on
          limited information. It&apos;s directional — book a call for a precise
          map.
        </div>
      )}
    </div>
  );
}
