import { config } from "../config";
import { brand } from "../brand";
import type { LeadSubmission } from "../schema";

/**
 * Email delivery boundary. The default provider just logs (safe for local/dev).
 * Set EMAIL_PROVIDER=resend + RESEND_API_KEY to actually send. Implement this
 * interface for any other ESP (SendGrid, Postmark, SES) without touching callers.
 */
export interface EmailService {
  sendReport(submission: LeadSubmission, reportUrl: string): Promise<boolean>;
}

class ConsoleEmailService implements EmailService {
  async sendReport(
    submission: LeadSubmission,
    reportUrl: string,
  ): Promise<boolean> {
    console.info(
      `[email:console] Would send Buyer Signal Map to ${submission.email} → ${reportUrl}`,
    );
    return true;
  }
}

/** Minimal Resend integration via their REST API (no extra dependency). */
class ResendEmailService implements EmailService {
  async sendReport(
    submission: LeadSubmission,
    reportUrl: string,
  ): Promise<boolean> {
    if (!config.email.resendApiKey) return false;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.email.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.email.from,
          to: [submission.email],
          subject: `Your Buyer Signal Map — ${submission.hostname}`,
          html: renderEmailHtml(submission, reportUrl),
        }),
      });
      if (!res.ok) {
        console.error(`[email:resend] failed: HTTP ${res.status}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[email:resend] error", (err as Error).message);
      return false;
    }
  }
}

let service: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!service) {
    service =
      config.email.provider === "resend"
        ? new ResendEmailService()
        : new ConsoleEmailService();
  }
  return service;
}

function renderEmailHtml(submission: LeadSubmission, reportUrl: string): string {
  const count = submission.report.signals.length;
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0B1522;line-height:1.6">
  <p>Here's your personalized <strong>Buyer Signal Map</strong> for <strong>${escapeHtml(
    submission.hostname,
  )}</strong>.</p>
  <p>We mapped <strong>${count}</strong> places your future customers are showing buying signals right now.</p>
  <p><a href="${escapeHtml(
    reportUrl,
  )}" style="display:inline-block;background:#1F6FEB;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View your report</a></p>
  <p style="color:#2a3d56;font-size:14px">When you're ready, book a strategy call and we'll turn the two highest-intent signals into a live outbound play.</p>
  <p style="color:#2a3d56;font-size:13px;margin-top:24px">— ${escapeHtml(
    brand.name,
  )}</p>
</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
