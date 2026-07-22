import type { BuyerSignalReport, BuyerSignal } from "./schema";

/**
 * STAGE 3 (seam) — deterministic normalization + scoring of signals.
 *
 * Today this normalizes the model's own scores and re-ranks signals so the report
 * is consistent regardless of the order Claude produced them. This is the natural
 * insertion point for a future High-Intent Signal Discovery harness: blend
 * external intent data into `score` here, then re-rank, without touching the
 * prompt or UI layers.
 */

const PRIORITY_WEIGHT: Record<BuyerSignal["priority"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function scoreAndRank(report: BuyerSignalReport): BuyerSignalReport {
  const signals = report.signals
    .map(normalizeSignal)
    .sort((a, b) => rankValue(b) - rankValue(a));

  return { ...report, signals };
}

function normalizeSignal(signal: BuyerSignal): BuyerSignal {
  const score = clamp(Math.round(signal.score), 0, 100);
  const low = Math.max(0, Math.round(signal.opportunity.low));
  const high = Math.max(low, Math.round(signal.opportunity.high));
  return {
    ...signal,
    score,
    opportunity: { ...signal.opportunity, low, high },
  };
}

/** Composite rank: model score, nudged by stated priority. */
function rankValue(signal: BuyerSignal): number {
  return signal.score + PRIORITY_WEIGHT[signal.priority] * 2;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Aggregate the total monthly opportunity range across all signals. */
export function totalOpportunity(report: BuyerSignalReport): {
  low: number;
  high: number;
} {
  return report.signals.reduce(
    (acc, s) => ({
      low: acc.low + s.opportunity.low,
      high: acc.high + s.opportunity.high,
    }),
    { low: 0, high: 0 },
  );
}
