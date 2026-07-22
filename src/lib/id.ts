import { randomUUID } from "node:crypto";

/**
 * Short, URL-safe, sortable-ish id: <base36 timestamp>-<random>.
 * Collision-resistant enough for lead submissions; readable in URLs.
 */
export function newId(): string {
  const time = Date.now().toString(36);
  const rand = randomUUID().replace(/-/g, "").slice(0, 10);
  return `${time}-${rand}`;
}
