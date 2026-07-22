import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { config } from "./config";

let client: Anthropic | null = null;

/** Lazily construct the Claude client. Returns null when no key is configured. */
export function getClient(): Anthropic | null {
  if (!config.anthropicApiKey) return null;
  if (!client) client = new Anthropic({ apiKey: config.anthropicApiKey });
  return client;
}

/** A hand-written JSON Schema object handed to Claude as a tool input schema. */
export type JsonSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

export interface StructuredCallOptions<T> {
  system: string;
  prompt: string;
  toolName: string;
  toolDescription: string;
  jsonSchema: JsonSchema;
  schema: z.ZodType<T>;
  maxTokens: number;
}

/**
 * Call Claude and get back a value that conforms to `schema`.
 *
 * Uses forced tool-use for structured output — the most portable, model- and
 * SDK-version-agnostic way to get consistent JSON. The result is validated with
 * Zod so callers always receive a well-typed, runtime-checked object.
 */
export async function generateStructured<T>(
  opts: StructuredCallOptions<T>,
): Promise<T> {
  const c = getClient();
  if (!c) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Set it, or run in DEMO_MODE.",
    );
  }

  // Cast through `unknown` so we don't depend on the exact nested InputSchema
  // type name across SDK versions; the Zod parse below is the real safety net.
  const tool = {
    name: opts.toolName,
    description: opts.toolDescription,
    input_schema: opts.jsonSchema,
  } as unknown as Anthropic.Tool;

  const res = await c.messages.create({
    model: config.model,
    max_tokens: opts.maxTokens,
    system: opts.system,
    tools: [tool],
    tool_choice: { type: "tool", name: opts.toolName },
    messages: [{ role: "user", content: opts.prompt }],
  });

  const block = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!block) {
    throw new Error("Claude did not return structured output.");
  }

  return opts.schema.parse(block.input);
}
