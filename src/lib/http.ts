import { headers } from "next/headers";

/**
 * Best-effort absolute base URL for the current request, used to build report
 * links in outbound email. Honors NEXT_PUBLIC_APP_URL when set (recommended in
 * production), otherwise derives from request headers.
 */
export function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  try {
    const h = headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`;
  } catch {
    /* headers() unavailable outside a request scope */
  }
  return "http://localhost:3000";
}
