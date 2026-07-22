import { generateStructured } from "./anthropic";
import {
  EXTRACTION_SYSTEM,
  EXTRACTION_TOOL,
  EXTRACTION_TOOL_DESCRIPTION,
  EXTRACTION_JSON_SCHEMA,
  buildExtractionPrompt,
  type ExtractionInput,
} from "./prompts/extraction";
import { CompanyProfileSchema, type CompanyProfile } from "./schema";

/**
 * STAGE 2 — turn cleaned site content into a structured CompanyProfile via Claude.
 * Kept separate from report synthesis so extraction can evolve independently.
 */
export async function analyzeSite(
  input: ExtractionInput,
): Promise<CompanyProfile> {
  return generateStructured<CompanyProfile>({
    system: EXTRACTION_SYSTEM,
    prompt: buildExtractionPrompt(input),
    toolName: EXTRACTION_TOOL,
    toolDescription: EXTRACTION_TOOL_DESCRIPTION,
    jsonSchema: EXTRACTION_JSON_SCHEMA,
    schema: CompanyProfileSchema,
    maxTokens: 1500,
  });
}
