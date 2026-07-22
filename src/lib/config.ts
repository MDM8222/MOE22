/**
 * Central, env-driven configuration. Read once and share.
 * Keeping this in one place makes the app easy to deploy and easy to reason about.
 */

function bool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim() || "";
const forcedDemo = bool(process.env.DEMO_MODE, false);

export const config = {
  /** The Claude model used for extraction + synthesis. */
  model: process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-8",
  anthropicApiKey,

  /**
   * Demo mode returns a deterministic sample report instead of calling Claude.
   * Auto-enabled when no API key is configured so the app runs out of the box.
   */
  demoMode: forcedDemo || anthropicApiKey.length === 0,

  /** Where lead submissions + reports are persisted (JSON file store). */
  dataDir: process.env.DATA_DIR?.trim() || ".data",

  email: {
    provider: (process.env.EMAIL_PROVIDER?.trim() || "console") as
      | "console"
      | "resend",
    resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
    from:
      process.env.EMAIL_FROM?.trim() ||
      "Streamline Connex <signals@streamlineconnex.com>",
  },

  crm: {
    provider: (process.env.CRM_PROVIDER?.trim() || "none") as
      | "none"
      | "webhook",
    webhookUrl: process.env.CRM_WEBHOOK_URL?.trim() || "",
  },

  /** How long (ms) to wait when fetching a target website. */
  fetchTimeoutMs: 10_000,
} as const;

export type AppConfig = typeof config;
