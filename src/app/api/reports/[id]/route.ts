import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/reports/[id] — fetch a persisted submission (results-page fallback). */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const submission = await getStore().get(params.id);
  if (!submission) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Report not found." } },
      { status: 404 },
    );
  }
  return NextResponse.json({ submission }, { status: 200 });
}
