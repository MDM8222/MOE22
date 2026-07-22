/**
 * Streamline Connex brand + positioning constants and CTA links.
 * Centralized so copy/links can be updated without touching components.
 */

export const brand = {
  name: "Streamline Connex",
  productName: "Buyer Signal Map",
  tagline: "Pipeline without building an SDR team.",
  positioning:
    "B2B outbound sales development and growth execution — revenue-focused, precise, AI-augmented, and founder-led.",

  /** Public links (also overridable via NEXT_PUBLIC_* env vars at build time). */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://streamlineconnex.com/",
  bookUrl: process.env.NEXT_PUBLIC_BOOK_URL || "https://streamlineconnex.com/",
  auditUrl: process.env.NEXT_PUBLIC_AUDIT_URL || "https://streamlineconnex.com/",

  services: [
    "Outbound appointment setting",
    "AI-augmented research",
    "ICP-targeted prospecting",
    "Verified contact data",
    "CRM enrichment",
    "Multi-channel outbound",
    "Inbound lead handling",
    "Strategy & reporting",
    "Affiliate / partner growth",
  ],
} as const;

/** Human-readable labels + accent treatment for each signal type. */
export const signalTypeMeta: Record<
  string,
  { label: string; tone: "signal" | "emerald" | "amber" | "ink" }
> = {
  timing: { label: "Timing", tone: "amber" },
  buying_research: { label: "Buying research", tone: "signal" },
  category_awareness: { label: "Category awareness", tone: "signal" },
  ecosystem_relationship: { label: "Ecosystem relationship", tone: "emerald" },
  intent_signal: { label: "Intent signal", tone: "signal" },
  hiring_growth: { label: "Hiring / growth", tone: "amber" },
  competitive_displacement: { label: "Competitive displacement", tone: "emerald" },
  technographic: { label: "Technographic", tone: "ink" },
  community_conversation: { label: "Community conversation", tone: "emerald" },
};

export function signalTypeLabel(type: string): string {
  return signalTypeMeta[type]?.label ?? type.replace(/_/g, " ");
}
