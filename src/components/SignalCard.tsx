import type { BuyerSignal } from "@/lib/schema";
import { signalTypeLabel, signalTypeMeta } from "@/lib/brand";

const TONE_CLASSES: Record<string, string> = {
  signal: "bg-signal/10 text-signal",
  emerald: "bg-emerald/10 text-emerald",
  amber: "bg-amber/10 text-amber",
  ink: "bg-ink/[0.07] text-ink-700",
};

const BAR_CLASSES: Record<string, string> = {
  signal: "bg-signal",
  emerald: "bg-emerald",
  amber: "bg-amber",
  ink: "bg-ink-700",
};

const PRIORITY_CLASSES: Record<BuyerSignal["priority"], string> = {
  high: "bg-emerald/10 text-emerald",
  medium: "bg-amber/10 text-amber",
  low: "bg-ink/[0.07] text-ink-600",
};

export function SignalCard({
  signal,
  index,
}: {
  signal: BuyerSignal;
  index: number;
}) {
  const tone = signalTypeMeta[signal.signalType]?.tone ?? "ink";
  return (
    <article className="card overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-ink text-sm font-semibold text-paper">
            {index + 1}
          </span>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]}`}
              >
                {signalTypeLabel(signal.signalType)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_CLASSES[signal.priority]}`}
              >
                {signal.priority} priority
              </span>
            </div>
            <h3 className="text-lg font-semibold leading-snug text-ink">
              {signal.name}
            </h3>
          </div>
        </div>

        <ScoreMeter score={signal.score} tone={tone} />
      </div>

      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <Field label="Where it appears">{signal.whereItAppears}</Field>
        <Field label="Why it matters">{signal.whyItMatters}</Field>
        <div className="sm:col-span-2">
          <Field label="What Streamline Connex would do">
            {signal.whatWeWouldDo}
          </Field>
        </div>
      </dl>

      <div className="mt-6 flex items-center justify-between border-t border-paper-line pt-4">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-600">
          Est. monthly opportunity
        </span>
        <span className="text-sm font-semibold text-ink">
          {signal.opportunity.low}–{signal.opportunity.high}{" "}
          <span className="font-normal text-ink-600">
            {signal.opportunity.metric}
          </span>
        </span>
      </div>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-600">
        {label}
      </dt>
      <dd className="mt-1.5 text-[15px] leading-relaxed text-ink-800">
        {children}
      </dd>
    </div>
  );
}

function ScoreMeter({ score, tone }: { score: number; tone: string }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="w-32 flex-none">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-600">
          Signal
        </span>
        <span className="text-sm font-semibold text-ink">{pct}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper-line">
        <div
          className={`h-full rounded-full ${BAR_CLASSES[tone] ?? "bg-ink-700"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
