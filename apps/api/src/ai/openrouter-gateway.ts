import { generateCompletion } from "@anvia/core";
import { OpenAIClient } from "@anvia/openai";
import { AiUnavailableError, type AiGateway } from "./gateway.js";
import { buildEnrichPrompt, ENRICH_INSTRUCTIONS, enrichSchema } from "./prompts/enrich.js";

export const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const DEFAULT_ENRICH_MODEL = "openai/gpt-4o-mini";

/**
 * Reads its configuration once at construction. A missing API key is not an
 * error at boot: the gateway stays usable and every call throws
 * AiUnavailableError, which the worker turns into a reverted note.
 */
export function createOpenRouterAiGateway(): AiGateway {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  const baseUrl = process.env["OPENROUTER_BASE_URL"] ?? DEFAULT_OPENROUTER_BASE_URL;
  const modelId = process.env["AI_ENRICH_MODEL"] ?? DEFAULT_ENRICH_MODEL;

  return {
    async enrich({ title, body }) {
      if (!apiKey) {
        throw new AiUnavailableError("OPENROUTER_API_KEY is not set");
      }

      const client = new OpenAIClient({ apiKey, baseUrl });
      const model = client.completionModel({ modelId, api: "chat" });
      const result = await generateCompletion({
        model,
        instructions: ENRICH_INSTRUCTIONS,
        prompt: buildEnrichPrompt({ title, body }),
        outputSchema: enrichSchema,
      });

      return result.output;
    },
  };
}
