import { config } from "./config";
import { FetchError } from "./errors";
import { fetchSiteContent, type SiteContent } from "./fetcher";
import { analyzeSite } from "./analyze";
import { synthesizeReport } from "./report";
import { scoreAndRank } from "./score";
import { buildDemoProfile, buildDemoReport } from "./demo";
import type { CompanyProfile, BuyerSignalReport } from "./schema";

export interface GenerationResult {
  status: "complete" | "partial";
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

export interface PipelineTarget {
  url: string;
  hostname: string;
}

/**
 * The core generation pipeline, framework-agnostic and side-effect free.
 *
 *   fetch (Stage 1) ▸ analyze (Stage 2) ▸ score (Stage 3) ▸ synthesize (Stage 4)
 *
 * Persistence, email, and CRM routing are handled by the caller so this stays
 * pure and testable. A future High-Intent Signal Discovery harness slots in
 * between analyze and synthesize.
 */
export async function runPipeline(
  target: PipelineTarget,
): Promise<GenerationResult> {
  const start = Date.now();

  // STAGE 1 — fetch + clean the website. Failure degrades, it does not abort.
  let site: SiteContent | null = null;
  let fetchError: string | undefined;
  try {
    site = await fetchSiteContent(target.url);
  } catch (err) {
    if (err instanceof FetchError) fetchError = err.message;
    else throw err;
  }

  const fetchMeta = {
    ok: Boolean(site),
    statusCode: site?.statusCode,
    title: site?.title,
    error: fetchError,
  };
  const status: GenerationResult["status"] = site ? "complete" : "partial";

  // Demo mode: deterministic sample, no Claude call.
  if (config.demoMode) {
    const profile = buildDemoProfile({
      hostname: target.hostname,
      title: site?.title,
      metaDescription: site?.metaDescription,
    });
    const report = scoreAndRank(buildDemoReport(profile));
    return {
      status,
      fetch: fetchMeta,
      profile,
      report,
      meta: {
        model: config.model,
        demo: true,
        source: "demo",
        generationMs: Date.now() - start,
      },
    };
  }

  // STAGE 2 — extract a structured profile (Claude call #1).
  const profile = await analyzeSite(
    site
      ? {
          hostname: target.hostname,
          title: site.title,
          metaDescription: site.metaDescription,
          headings: site.headings,
          text: site.text,
        }
      : {
          hostname: target.hostname,
          title: "",
          metaDescription: "",
          headings: [],
          text: "",
          degraded: true,
        },
  );

  // STAGE 4 — synthesize the report (Claude call #2), then STAGE 3 normalize/rank.
  const report = scoreAndRank(await synthesizeReport(profile));

  return {
    status,
    fetch: fetchMeta,
    profile,
    report,
    meta: {
      model: config.model,
      demo: false,
      source: "live",
      generationMs: Date.now() - start,
    },
  };
}
