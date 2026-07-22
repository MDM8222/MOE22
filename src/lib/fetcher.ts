import { config } from "./config";
import { FetchError } from "./errors";
import { isBlockedHost } from "./validation";

export interface SiteContent {
  url: string;
  finalUrl: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  /** Cleaned, readable text extracted from the page (truncated). */
  text: string;
  headings: string[];
}

const MAX_TEXT_CHARS = 12_000;
const MAX_BYTES = 2_500_000; // ~2.5MB safety cap on the downloaded HTML

/**
 * Stage 1 of the pipeline: fetch the target website and reduce it to clean,
 * model-ready text. Intentionally dependency-free (regex-based) so the app stays
 * light to deploy. Throws FetchError on any network/parse failure so callers can
 * degrade gracefully rather than crash.
 */
export async function fetchSiteContent(url: string): Promise<SiteContent> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.fetchTimeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "StreamlineConnex-BuyerSignalMap/1.0 (+https://streamlineconnex.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (err) {
    throw new FetchError(
      "We couldn't reach that website. Check the address and try again.",
      { cause: (err as Error)?.message },
    );
  } finally {
    clearTimeout(timeout);
  }

  // Guard against redirect-to-internal SSRF.
  try {
    const finalHost = new URL(res.url).hostname.toLowerCase();
    if (isBlockedHost(finalHost)) {
      throw new FetchError("That website redirects somewhere we can't scan.");
    }
  } catch (e) {
    if (e instanceof FetchError) throw e;
  }

  if (!res.ok) {
    throw new FetchError(
      `That website returned an error (HTTP ${res.status}).`,
      { statusCode: res.status },
    );
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType && !/text\/html|application\/xhtml|text\/plain/i.test(contentType)) {
    throw new FetchError("That link isn't a readable web page.");
  }

  const html = await readCapped(res, MAX_BYTES);
  const extracted = extractFromHtml(html);

  if (!extracted.text || extracted.text.length < 60) {
    throw new FetchError(
      "We reached the site but couldn't read enough content to analyze it.",
    );
  }

  return {
    url,
    finalUrl: res.url,
    statusCode: res.status,
    ...extracted,
  };
}

/** Read a response body but stop after `maxBytes` to avoid memory blowups. */
async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return await res.text();

  const decoder = new TextDecoder("utf-8", { fatal: false });
  let received = 0;
  let out = "";
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (received >= maxBytes) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      break;
    }
  }
  out += decoder.decode();
  return out;
}

/** Turn raw HTML into title, meta description, headings, and clean body text. */
export function extractFromHtml(html: string): Omit<
  SiteContent,
  "url" | "finalUrl" | "statusCode"
> {
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription =
    metaContent(html, "description") ||
    metaProperty(html, "og:description") ||
    "";

  const headings = collectAll(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)
    .map(decodeAndStrip)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length < 200)
    .slice(0, 25);

  // Strip out non-content blocks before extracting body text.
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ");

  const text = decodeAndStrip(body)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_CHARS);

  return {
    title: decodeAndStrip(title).trim().slice(0, 200),
    metaDescription: decodeAndStrip(metaDescription).trim().slice(0, 400),
    text,
    headings,
  };
}

function metaContent(html: string, name: string): string {
  const re = new RegExp(
    `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  return firstMatch(html, re);
}

function metaProperty(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  return firstMatch(html, re);
}

function firstMatch(text: string, re: RegExp): string {
  const m = text.match(re);
  return m?.[1] ?? "";
}

function collectAll(text: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

/** Remove tags and decode a small set of common HTML entities. */
function decodeAndStrip(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "…")
    .replace(/&#(\d+);/g, (_, code) => safeFromCharCode(Number(code)));
}

function safeFromCharCode(code: number): string {
  try {
    return String.fromCodePoint(code);
  } catch {
    return " ";
  }
}
