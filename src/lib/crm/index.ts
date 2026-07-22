import { config } from "../config";
import type { LeadSubmission } from "../schema";

/**
 * CRM routing boundary. Default = no-op. Set CRM_PROVIDER=webhook + CRM_WEBHOOK_URL
 * to POST each lead to a webhook (Zapier/Make/HubSpot workflow/custom endpoint).
 * Implement this interface for a native HubSpot/Salesforce integration later.
 */
export interface CrmService {
  routeLead(submission: LeadSubmission): Promise<boolean>;
}

class NoopCrmService implements CrmService {
  async routeLead(): Promise<boolean> {
    return true;
  }
}

class WebhookCrmService implements CrmService {
  async routeLead(submission: LeadSubmission): Promise<boolean> {
    if (!config.crm.webhookUrl) return false;
    try {
      const res = await fetch(config.crm.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission.id,
          createdAt: submission.createdAt,
          email: submission.email,
          website: submission.normalizedUrl,
          hostname: submission.hostname,
          status: submission.status,
          company: submission.profile.companyName,
          category: submission.profile.category,
          industriesServed: submission.profile.industriesServed,
          signalCount: submission.report.signals.length,
          topSignals: submission.report.signals
            .slice(0, 3)
            .map((s) => s.name),
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("[crm:webhook] error", (err as Error).message);
      return false;
    }
  }
}

let service: CrmService | null = null;

export function getCrmService(): CrmService {
  if (!service) {
    service =
      config.crm.provider === "webhook"
        ? new WebhookCrmService()
        : new NoopCrmService();
  }
  return service;
}
