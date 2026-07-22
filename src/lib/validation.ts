import { ValidationError } from "./errors";

export interface NormalizedTarget {
  /** Fully-qualified URL we will fetch, e.g. https://acme.com */
  url: string;
  hostname: string;
}

/** Pragmatic email check — rejects obviously malformed addresses. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(raw: string): string {
  const email = (raw || "").trim();
  if (!email) throw fieldError("email", "Enter your work email.");
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    throw fieldError("email", "That doesn't look like a valid email.");
  }
  return email.toLowerCase();
}

/**
 * Normalize + validate a company website URL.
 * Adds a scheme if missing, requires a real hostname, and blocks private/internal
 * hosts (SSRF guard — we fetch this URL server-side).
 */
export function normalizeUrl(raw: string): NormalizedTarget {
  let input = (raw || "").trim();
  if (!input) throw fieldError("url", "Enter your company website.");

  // Drop a leading scheme-less "www." consistently by first ensuring a scheme.
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw fieldError("url", "That doesn't look like a valid website URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw fieldError("url", "Use an http(s) website URL.");
  }

  const hostname = parsed.hostname.toLowerCase();

  // Must look like a real public domain (has a dot, not an IP-only localhost, etc.)
  if (!hostname.includes(".") || hostname.endsWith(".")) {
    throw fieldError("url", "Enter a full domain, like acme.com.");
  }

  if (isBlockedHost(hostname)) {
    throw fieldError("url", "Enter a public company website.");
  }

  // Rebuild a clean URL (scheme + host + path), dropping fragments.
  const clean = new URL(parsed.toString());
  clean.hash = "";
  return { url: clean.toString(), hostname };
}

/** Block loopback, link-local, and RFC1918 private ranges to prevent SSRF. */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) {
    return true;
  }
  if (h === "0.0.0.0" || h === "::1" || h === "[::1]") return true;

  // IPv4 literal ranges
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    return true; // block bare IPs generally — we expect a domain
  }
  return false;
}

export function validateGenerateInput(body: unknown): {
  email: string;
  target: NormalizedTarget;
  inputUrl: string;
} {
  const obj = (body ?? {}) as Record<string, unknown>;
  const fields: Record<string, string> = {};

  let email = "";
  let target: NormalizedTarget | null = null;
  const inputUrl = typeof obj.url === "string" ? obj.url.trim() : "";

  try {
    email = validateEmail(String(obj.email ?? ""));
  } catch (e) {
    if (e instanceof ValidationError) Object.assign(fields, e.fields);
    else throw e;
  }
  try {
    target = normalizeUrl(String(obj.url ?? ""));
  } catch (e) {
    if (e instanceof ValidationError) Object.assign(fields, e.fields);
    else throw e;
  }

  if (Object.keys(fields).length > 0 || !target) {
    throw new ValidationError(fields);
  }
  return { email, target, inputUrl };
}

function fieldError(field: string, message: string): ValidationError {
  return new ValidationError({ [field]: message });
}
