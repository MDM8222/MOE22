import { generateStructured } from "./anthropic";
import {
  SYNTHESIS_SYSTEM,
  SYNTHESIS_TOOL,
  SYNTHESIS_TOOL_DESCRIPTION,
  SYNTHESIS_JSON_SCHEMA,
  buildSynthesisPrompt,
} from "./prompts/synthesis";
import { BuyerSignalReportSchema, type BuyerSignalReport, type CompanyProfile } from "./schema";

/**
 * STAGE 4 — synthesize the Buyer Signal Report from a CompanyProfile via Claude.
 * This is the report-generation engine; the prompt is the highest-leverage surface.
 */
export async function synthesizeReport(
  profile: CompanyProfile,
): Promise<BuyerSignalReport> {
  return generateStructured<BuyerSignalReport>({
    system: SYNTHESIS_SYSTEM,
    prompt: buildSynthesisPrompt(profile),
    toolName: SYNTHESIS_TOOL,
    toolDescription: SYNTHESIS_TOOL_DESCRIPTION,
    jsonSchema: SYNTHESIS_JSON_SCHEMA,
    schema: BuyerSignalReportSchema,
    maxTokens: 6000,
  });
}
