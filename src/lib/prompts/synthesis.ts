import type { JsonSchema } from "../anthropic";
import type { CompanyProfile } from "../schema";
import { SIGNAL_TYPES, PRIORITIES } from "../schema";

/**
 * STAGE 4 — Buyer-signal report synthesis.
 *
 * This is the stable "engine" prompt. It takes a structured CompanyProfile and
 * produces the Buyer Signal Report. It encodes the Streamline Connex worldview so
 * output stays consistent, consultative, and on-brand across every run. Keep this
 * prompt stable; iterate deliberately (it is the highest-leverage surface to
 * improve report quality and later attach signal scoring / external data to).
 */

export const SYNTHESIS_SYSTEM = `You are the senior strategist behind Streamline Connex — a B2B outbound sales development and growth-execution company. Streamline Connex helps clients build pipeline without building an in-house SDR team, using AI-augmented research, ICP-targeted prospecting, verified contact data, CRM enrichment, and multi-channel outbound.

Your job: given a structured profile of a company, produce a "Buyer Signal Map" — a consultative report that identifies 5 to 8 distinct environments where that company's ideal prospects are actively revealing buying signals right now, and exactly what Streamline Connex would do with each one.

What "buyer signals" means here:
- Observable, present-tense evidence that a prospect is in or near a buying window.
- Signal TYPES to draw from (use the enum values): timing (funding, leadership changes, expansion, renewals, fiscal cycles), buying_research (comparison/review activity, RFP behavior, "vs" searches), category_awareness (people describing the problem your client solves), ecosystem_relationship (partners, integrations, adjacent-tool users, communities), intent_signal (topic surges, content engagement, event attendance), hiring_growth (job posts implying the need), competitive_displacement (dissatisfaction with an incumbent), technographic (tech stack presence/absence), community_conversation (forums, groups, associations where the ICP gathers).

Standards for a great report:
- Be specific to THIS company's offering, ICP, and industries — never generic. Name concrete places, platforms, roles, triggers, and search behaviors a real SDR could act on.
- Each signal must be distinct (don't restate the same idea).
- Prioritize signals by realistic pipeline impact for an outbound motion.
- "whatWeWouldDo" must read like a precise operator's playbook: the specific outbound play Streamline Connex would run (channel, angle, list-building/enrichment approach, message hook), not vague advice.
- "opportunity" is a grounded, defensible monthly RANGE for what this signal could realistically produce, expressed in a sensible metric (usually "qualified meetings" or "qualified opportunities"). Keep ranges honest and conservative for the company's apparent scale.
- "score" is a 0–100 heuristic of signal strength/actionability for prioritization (higher = stronger). Reserve 80+ for the clearest, highest-intent signals.

Tone: premium, precise, revenue-focused, founder-led. Consultative and credible — never spammy, never hypey, no emojis. Write as if briefing a founder who is smart and busy.

Report sections you must write:
- "howWeSeeYourBusiness": 2–4 sentences reflecting back how Streamline Connex understands their business and who they sell to. This should feel insightful and earn trust.
- "positioningSummary": one crisp sentence naming their category and core ICP.
- "signals": 5–8 buyer-signal environments.
- "summary": a short synthesis tying the signals together into a coherent outbound thesis.
- "recommendedNextStep": one clear, low-friction next action (booking a strategy call or requesting a full outbound audit), phrased for this specific company.`;

export const SYNTHESIS_TOOL = "record_buyer_signal_report";
export const SYNTHESIS_TOOL_DESCRIPTION =
  "Record the structured Buyer Signal Map report for this company.";

const SIGNAL_ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "name",
    "signalType",
    "whereItAppears",
    "whyItMatters",
    "whatWeWouldDo",
    "opportunity",
    "priority",
    "score",
  ],
  properties: {
    name: { type: "string", description: "Short, concrete name for the signal." },
    signalType: {
      type: "string",
      enum: [...SIGNAL_TYPES],
      description: "The category of buying signal.",
    },
    whereItAppears: {
      type: "string",
      description: "Concrete place(s)/platform(s) where this signal shows up.",
    },
    whyItMatters: {
      type: "string",
      description: "Why this signal indicates buying intent for THIS company.",
    },
    whatWeWouldDo: {
      type: "string",
      description: "The specific outbound play Streamline Connex would run on it.",
    },
    opportunity: {
      type: "object",
      additionalProperties: false,
      required: ["metric", "low", "high"],
      properties: {
        metric: {
          type: "string",
          description: "Unit for the range, e.g. 'qualified meetings / month'.",
        },
        low: { type: "integer", description: "Conservative monthly low end." },
        high: { type: "integer", description: "Realistic monthly high end." },
      },
    },
    priority: {
      type: "string",
      enum: [...PRIORITIES],
      description: "Priority for an outbound motion.",
    },
    score: {
      type: "integer",
      description: "0–100 heuristic of signal strength/actionability.",
    },
  },
};

export const SYNTHESIS_JSON_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "howWeSeeYourBusiness",
    "positioningSummary",
    "signals",
    "summary",
    "recommendedNextStep",
  ],
  properties: {
    howWeSeeYourBusiness: {
      type: "string",
      description: "2–4 sentences reflecting back how we understand their business.",
    },
    positioningSummary: {
      type: "string",
      description: "One crisp sentence naming their category and core ICP.",
    },
    signals: {
      type: "array",
      minItems: 5,
      maxItems: 8,
      items: SIGNAL_ITEM_SCHEMA,
      description: "5 to 8 distinct buyer-signal environments.",
    },
    summary: {
      type: "string",
      description: "Short synthesis tying the signals into an outbound thesis.",
    },
    recommendedNextStep: {
      type: "string",
      description: "One clear, low-friction next action for this company.",
    },
  },
};

export function buildSynthesisPrompt(profile: CompanyProfile): string {
  return `Produce the Buyer Signal Map for the company described by this profile. Return 5 to 8 distinct, high-quality signals tailored specifically to this business.

COMPANY PROFILE (structured):
${JSON.stringify(profile, null, 2)}

Remember:
- Be concrete and specific to this exact offering, ICP, industries, and buyer roles.
- Make each signal genuinely distinct and independently actionable.
- Keep opportunity ranges honest and appropriate to the company's apparent scale.`;
}
