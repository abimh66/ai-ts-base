/**
 * The seam between the app and whatever model provider is configured. Modules
 * depend on this interface, never on the OpenRouter implementation, so tests can
 * substitute a fake and a project can swap providers without touching callers.
 */
export interface EnrichInput {
  title: string;
  body: string;
}

export interface EnrichOutput {
  summary: string;
  tags: string[];
}

export interface AiGateway {
  enrich(input: EnrichInput): Promise<EnrichOutput>;
}

/**
 * Raised when no provider is configured or the provider refuses the request.
 * The worker catches this and returns the note to Draft, so an unconfigured
 * project still runs end to end with AI switched off.
 */
export class AiUnavailableError extends Error {
  constructor(message = "AI provider is unavailable") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

export function createUnavailableAiGateway(): AiGateway {
  return {
    enrich: async () => {
      throw new AiUnavailableError();
    },
  };
}
