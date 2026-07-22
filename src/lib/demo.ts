import type { CompanyProfile, BuyerSignalReport } from "./schema";

/**
 * Deterministic sample generator used when no ANTHROPIC_API_KEY is configured
 * (DEMO_MODE). It lets the app run end-to-end out of the box for local review and
 * previews. Output is clearly flagged as demo in the UI. This is NOT the report
 * engine — the real engine is Claude via analyze.ts + report.ts.
 */

export interface DemoInput {
  hostname: string;
  title?: string;
  metaDescription?: string;
}

function companyNameFromHost(hostname: string): string {
  const core = hostname.replace(/^www\./, "").split(".")[0] || hostname;
  return core
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildDemoProfile(input: DemoInput): CompanyProfile {
  const name = companyNameFromHost(input.hostname);
  return {
    companyName: name,
    offering:
      input.metaDescription?.slice(0, 200) ||
      `${name} sells a B2B product/service to other businesses (sample profile — configure ANTHROPIC_API_KEY for a real analysis).`,
    category: "B2B product / service",
    targetAudience:
      "Mid-market B2B companies whose revenue teams need more qualified pipeline.",
    businessModel: "Recurring / subscription or retainer revenue.",
    industriesServed: ["Technology", "Professional services", "SaaS"],
    icpRoles: ["Founder / CEO", "VP Sales", "Head of Growth", "RevOps"],
    notableDetails: [
      `Analyzed from ${input.hostname}`,
      "Sample profile generated in demo mode",
    ],
    confidence: "low",
  };
}

export function buildDemoReport(profile: CompanyProfile): BuyerSignalReport {
  const name = profile.companyName;
  return {
    howWeSeeYourBusiness: `${name} appears to sell to revenue-focused B2B teams that need predictable pipeline. Their buyers are the leaders responsible for growth — the exact profile Streamline Connex targets with AI-augmented, ICP-precise outbound. (This is a demo report; add an API key to generate a live analysis.)`,
    positioningSummary: `${name} — a B2B offering sold to growth and revenue leaders at mid-market companies.`,
    summary:
      "Across these environments, your future customers are already signaling intent — through timing triggers, active research, hiring, and the communities they gather in. Streamline Connex turns those scattered signals into a coordinated, multi-channel outbound motion so your team talks to buyers while the window is open.",
    recommendedNextStep: `Book a 20-minute strategy call and we'll map the two highest-intent signals for ${name} into a concrete outbound play — or request a full outbound audit.`,
    signals: [
      {
        name: "New revenue-leadership hires",
        signalType: "timing",
        whereItAppears:
          "LinkedIn role changes, company announcements, and job-title updates among your ICP accounts.",
        whyItMatters:
          "A new VP Sales or Head of Growth reassesses tooling and vendors in their first 90 days — a reliable buying window.",
        whatWeWouldDo:
          "Monitor role changes across your target account list, enrich the new leader's contact, and run a founder-signed multi-channel sequence referencing their mandate.",
        opportunity: { metric: "qualified meetings / month", low: 6, high: 14 },
        priority: "high",
        score: 86,
      },
      {
        name: "Active category research ('vs' and comparison behavior)",
        signalType: "buying_research",
        whereItAppears:
          "Review sites, comparison searches, and vendor-shortlist content in your category.",
        whyItMatters:
          "Prospects comparing options are in-market now, not someday — the highest-conversion moment for outbound.",
        whatWeWouldDo:
          "Build a list from category-research behavior, then reach out with a sharp, differentiated angle before a competitor's rep does.",
        opportunity: { metric: "qualified meetings / month", low: 5, high: 12 },
        priority: "high",
        score: 82,
      },
      {
        name: "Hiring posts that imply the need",
        signalType: "hiring_growth",
        whereItAppears:
          "Job boards and careers pages posting roles adjacent to the problem you solve.",
        whyItMatters:
          "A company hiring for the pain you remove is actively feeling it — and often prefers a solution over a headcount.",
        whatWeWouldDo:
          "Track relevant job posts, map the hiring manager and their exec, and lead with a 'buy vs. build' outbound narrative.",
        opportunity: { metric: "qualified meetings / month", low: 4, high: 9 },
        priority: "medium",
        score: 74,
      },
      {
        name: "Ecosystem & integration adjacency",
        signalType: "ecosystem_relationship",
        whereItAppears:
          "User bases of complementary tools, partner directories, and integration marketplaces.",
        whyItMatters:
          "Companies already using adjacent tools are pre-qualified for your offering and easier to reach with warm framing.",
        whatWeWouldDo:
          "Build target lists from adjacent-tool ecosystems and run partner-framed outbound that borrows that credibility.",
        opportunity: { metric: "qualified meetings / month", low: 4, high: 10 },
        priority: "medium",
        score: 71,
      },
      {
        name: "Funding & expansion triggers",
        signalType: "timing",
        whereItAppears:
          "Funding announcements, new-office news, and headcount growth among target accounts.",
        whyItMatters:
          "Fresh capital and expansion create budget and urgency to invest in growth infrastructure.",
        whatWeWouldDo:
          "Watch funding/expansion triggers across your ICP and launch timely, congratulatory-but-commercial sequences.",
        opportunity: { metric: "qualified meetings / month", low: 3, high: 8 },
        priority: "medium",
        score: 68,
      },
      {
        name: "Community & association conversations",
        signalType: "community_conversation",
        whereItAppears:
          "Industry forums, Slack/Discord communities, and professional associations where your ICP gathers.",
        whyItMatters:
          "Buyers describe their problems in their own words here — a rich source of timing and messaging signal.",
        whatWeWouldDo:
          "Identify the communities your ICP lives in, listen for problem language, and personalize outbound with that exact language.",
        opportunity: { metric: "qualified meetings / month", low: 3, high: 7 },
        priority: "low",
        score: 63,
      },
    ],
  };
}
