import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "../config";
import type { LeadSubmission } from "../schema";
import type { LeadStore } from "./index";

/**
 * JSON-file implementation of LeadStore.
 *
 * Layout:
 *   <DATA_DIR>/leads/<id>.json   — one file per submission
 *   <DATA_DIR>/index.jsonl       — append-only index (id, createdAt, email, host)
 *
 * Suitable for single-node deploys (`next start`) with a persistent disk. For
 * serverless, mount a volume or replace this with a database implementation.
 */
export class FileLeadStore implements LeadStore {
  private root = path.resolve(process.cwd(), config.dataDir);
  private leadsDir = path.join(this.root, "leads");
  private indexFile = path.join(this.root, "index.jsonl");

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.leadsDir, { recursive: true });
  }

  async save(submission: LeadSubmission): Promise<void> {
    await this.ensureDir();
    const file = path.join(this.leadsDir, `${submission.id}.json`);
    await fs.writeFile(file, JSON.stringify(submission, null, 2), "utf8");

    const indexLine =
      JSON.stringify({
        id: submission.id,
        createdAt: submission.createdAt,
        email: submission.email,
        hostname: submission.hostname,
        status: submission.status,
      }) + "\n";
    await fs.appendFile(this.indexFile, indexLine, "utf8");
  }

  async get(id: string): Promise<LeadSubmission | null> {
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null; // guard against path traversal
    try {
      const raw = await fs.readFile(
        path.join(this.leadsDir, `${id}.json`),
        "utf8",
      );
      return JSON.parse(raw) as LeadSubmission;
    } catch {
      return null;
    }
  }

  async list(limit = 50): Promise<LeadSubmission[]> {
    try {
      const raw = await fs.readFile(this.indexFile, "utf8");
      const ids = raw
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line).id as string;
          } catch {
            return null;
          }
        })
        .filter((id): id is string => Boolean(id))
        .reverse()
        .slice(0, limit);

      const records = await Promise.all(ids.map((id) => this.get(id)));
      return records.filter((r): r is LeadSubmission => r !== null);
    } catch {
      return [];
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.ensureDir();
      const probe = path.join(this.root, ".healthcheck");
      await fs.writeFile(probe, String(Date.now()), "utf8");
      await fs.unlink(probe);
      return true;
    } catch {
      return false;
    }
  }
}
