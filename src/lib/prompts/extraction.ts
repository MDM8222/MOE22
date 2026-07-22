import type { JsonSchema } from "../anthropic";
import { CONFIDENCE } from "../schema";

/**
 * STAGE 2 — Company-site extraction.
 *
 * Deliberately kept separate from report synthesis so it can be tuned, evaluated,
 * and eventually enriched with external data independently. This prompt only reads
 * the website and produces a structured CompanyProfile — it does NOT reason about
 * buyer signals (that is the synthesis stage's job).
 */

export const EXTRACTION_SYSTEM = `You are a precise B2B research analyst working for Streamline Connex, an outbound sales development and growth-execution company.

Your only job in this step is to read a company's website content and infer a clean, structured profile of that company. Do not speculate about sales strategy or buyer signals here — just extract what the business is, who it sells to, and how it makes money.

Rules:
- Base every field strictly on the provided website content. Do not invent facts.
- Prefer concrete, specific language over marketing fluff.
- If the site is thin or ambiguous, still produce your best-supported inference and lower the "confidence" field accordingly.
- "icpRoles" should be the specific buyer/decision-maker job titles most likely to purchase this offering.
- "notableDetails" are 2–5 short, factual observations useful for downstream targeting (e.g. pricing model, notable customers, geography, integrations, scale).
- Write in plain, professional English. No emojis.`;

export const EXTRACTION_TOOL = "record_company_profile";
export const EXTRACTION_TOOL_DESCRIPTION =
  "Record the structured profile inferred from the company's website.";

export const EXTRACTION_JSON_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "companyName",
    "offering",
    "category",
    "targetAudience",
    "businessModel",
    "industriesServed",
    "icpRoles",
    "notableDetails",
    "confidence",
  ],
  properties: {
    companyName: {
      type: "string",
      description: "The company's name as presented on the site.",
    },
    offering: {
      type: "string",
      description: "One or two sentences on what the company actually offers.",
    },
    category: {
      type: "string",
      description: "The product/service category (e.g. 'HR compliance software').",
    },
    targetAudience: {
      type: "string",
      description: "The ideal customer profile (ICP) in one or two sentences.",
    },
    businessModel: {
      type: "string",
      description: "How the company makes money (e.g. SaaS subscription, agency retainer, marketplace take-rate).",
    },
    industriesServed: {
      type: "array",
      items: { type: "string" },
      description: "Industries or verticals the company serves.",
    },
    icpRoles: {
      type: "array",
      items: { type: "string" },
      description: "Buyer/decision-maker job titles most likely to purchase.",
    },
    notableDetails: {
      type: "array",
      items: { type: "string" },
      description: "2–5 short factual observations useful for targeting.",
    },
    confidence: {
      type: "string",
      enum: [...CONFIDENCE],
      description: "How confident you are in this profile given the site content.",
    },
  },
};

export interface ExtractionInput {
  hostname: string;
  title: string;
  metaDescription: string;
  headings: string[];
  text: string;
  /** When true, the site couldn't be read; infer conservatively from the domain. */
  degraded?: boolean;
}

export function buildExtractionPrompt(input: ExtractionInput): string {
  if (input.degraded) {
    return `We were unable to read the website content for the domain below. Produce a conservative, clearly low-confidence profile inferred ONLY from the domain name and any hints available. Set "confidence" to "low".

Domain: ${input.hostname}`;
  }

  const headings = input.headings.length
    ? input.headings.map((h) => `- ${h}`).join("\n")
    : "(none found)";

  return `Analyze the following website content and produce the structured company profile.

DOMAIN: ${input.hostname}
PAGE TITLE: ${input.title || "(none)"}
META DESCRIPTION: ${input.metaDescription || "(none)"}

KEY HEADINGS:
${headings}

PAGE TEXT (may be truncated):
"""
${input.text}
"""`;
}
