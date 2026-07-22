import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/health — readiness for deploy checks. */
export async function GET() {
  const storageWritable = await getStore().isHealthy();
  return NextResponse.json({
    ok: true,
    model: config.model,
    demoMode: config.demoMode,
    storageWritable,
    email: config.email.provider,
    crm: config.crm.provider,
    time: new Date().toISOString(),
  });
}
