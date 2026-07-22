import { NextResponse } from "next/server";
import { validateGenerateInput } from "@/lib/validation";
import { runPipeline } from "@/lib/pipeline";
import { getStore } from "@/lib/store";
import { getEmailService } from "@/lib/email";
import { getCrmService } from "@/lib/crm";
import { getBaseUrl } from "@/lib/http";
import { newId } from "@/lib/id";
import { AppError, ValidationError } from "@/lib/errors";
import type { LeadSubmission } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate
 * Body: { url: string, email: string }
 * Validates input, runs the generation pipeline, persists the submission, and
 * fires email + CRM hooks. Returns the full record so the client can render the
 * results page immediately (and cache it) regardless of the storage backend.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "validation_error", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  try {
    const { email, target, inputUrl } = validateGenerateInput(body);

    const result = await runPipeline(target);

    const submission: LeadSubmission = {
      id: newId(),
      createdAt: new Date().toISOString(),
      email,
      inputUrl: inputUrl || target.url,
      normalizedUrl: target.url,
      hostname: target.hostname,
      status: result.status,
      fetch: result.fetch,
      profile: result.profile,
      report: result.report,
      meta: result.meta,
    };

    // Persist (best-effort — never lose the report if the store is unavailable).
    try {
      await getStore().save(submission);
    } catch (err) {
      console.error("[generate] store.save failed:", (err as Error).message);
    }

    // Fire-and-report side effects (do not block the user on them).
    const reportUrl = `${getBaseUrl()}/report/${submission.id}`;
    const [emailed, routed] = await Promise.all([
      safe(() => getEmailService().sendReport(submission, reportUrl)),
      safe(() => getCrmService().routeLead(submission)),
    ]);

    return NextResponse.json(
      { id: submission.id, submission, delivery: { emailed, routed } },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message, fields: err.fields } },
        { status: err.status },
      );
    }
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.status },
      );
    }
    console.error("[generate] unexpected error:", err);
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: "We hit a problem generating your report. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

async function safe(fn: () => Promise<boolean>): Promise<boolean> {
  try {
    return await fn();
  } catch {
    return false;
  }
}
