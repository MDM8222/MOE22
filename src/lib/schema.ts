import { z } from "zod";

/**
 * The structured contract for the whole app.
 *
 * These Zod schemas validate Claude's structured output at runtime, and their
 * inferred types are the single source of truth used across the backend, the
 * store, and the UI. The matching JSON Schemas handed to Claude live next to the
 * prompts in `lib/prompts/` so prompt logic stays separate from UI code.
 */

export const SIGNAL_TYPES = [
  "timing",
  "buying_research",
  "category_awareness",
  "ecosystem_relationship",
  "intent_signal",
  "hiring_growth",
  "competitive_displacement",
  "technographic",
  "community_conversation",
] as const;

export const PRIORITIES = ["high", "medium", "low"] as const;
export const CONFIDENCE = ["high", "medium", "low"] as const;

/** Stage 2 output: what Claude infers about the company from its website. */
export const CompanyProfileSchema = z.object({
  companyName: z.string(),
  offering: z.string(),
  category: z.string(),
  targetAudience: z.string(),
  businessModel: z.string(),
  industriesServed: z.array(z.string()),
  icpRoles: z.array(z.string()),
  notableDetails: z.array(z.string()),
  confidence: z.enum(CONFIDENCE),
});
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

export const OpportunitySchema = z.object({
  metric: z.string(),
  low: z.number(),
  high: z.number(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export const BuyerSignalSchema = z.object({
  name: z.string(),
  signalType: z.enum(SIGNAL_TYPES),
  whereItAppears: z.string(),
  whyItMatters: z.string(),
  whatWeWouldDo: z.string(),
  opportunity: OpportunitySchema,
  priority: z.enum(PRIORITIES),
  score: z.number(),
});
export type BuyerSignal = z.infer<typeof BuyerSignalSchema>;

/** Stage 4 output: the report Claude synthesizes from the CompanyProfile. */
export const BuyerSignalReportSchema = z.object({
  howWeSeeYourBusiness: z.string(),
  positioningSummary: z.string(),
  signals: z.array(BuyerSignalSchema).min(1),
  summary: z.string(),
  recommendedNextStep: z.string(),
});
export type BuyerSignalReport = z.infer<typeof BuyerSignalReportSchema>;

/** The persisted record for one submission. */
export interface LeadSubmission {
  id: string;
  createdAt: string;
  email: string;
  inputUrl: string;
  normalizedUrl: string;
  hostname: string;
  status: "complete" | "partial" | "failed";
  fetch: {
    ok: boolean;
    statusCode?: number;
    title?: string;
    error?: string;
  };
  profile: CompanyProfile;
  report: BuyerSignalReport;
  meta: {
    model: string;
    demo: boolean;
    source: "live" | "demo";
    generationMs: number;
  };
}
