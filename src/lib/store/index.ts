import type { LeadSubmission } from "../schema";
import { FileLeadStore } from "./fileStore";

/**
 * Persistence boundary for lead submissions + generated reports.
 *
 * The default implementation writes JSON files. To move to Postgres / Supabase /
 * DynamoDB / etc. for a production or serverless deploy, implement this interface
 * and swap the instance created below — nothing else in the app changes.
 */
export interface LeadStore {
  save(submission: LeadSubmission): Promise<void>;
  get(id: string): Promise<LeadSubmission | null>;
  /** Most recent submissions first (for a future account/history view). */
  list(limit?: number): Promise<LeadSubmission[]>;
  /** Whether the backing store is writable right now (health checks). */
  isHealthy(): Promise<boolean>;
}

let store: LeadStore | null = null;

export function getStore(): LeadStore {
  if (!store) store = new FileLeadStore();
  return store;
}
