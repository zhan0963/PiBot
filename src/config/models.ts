export type LLMProvider = 'anthropic' | 'ollama';

export interface ModelConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  maxTokens: number;
  contextWindow: number;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // --- Anthropic models ---
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 4096,
    contextWindow: 200000,
  },

];

// Dynamic Ollama models discovered at runtime
const ollamaModels: ModelConfig[] = [];

function allModels(): ModelConfig[] {
  return [...AVAILABLE_MODELS, ...ollamaModels];
}

export function getModelById(id: string): ModelConfig | undefined {
  return allModels().find(m => m.id === id);
}

export function getModelsByProvider(provider: LLMProvider): ModelConfig[] {
  return allModels().filter(m => m.provider === provider);
}

/**
 * Register Ollama models discovered at runtime from the local Ollama instance.
 * Called once at startup after querying Ollama's /api/tags endpoint.
 */
export function registerOllamaModels(modelNames: string[]): void {
  // Clear previous dynamic models
  ollamaModels.length = 0;

  for (const name of modelNames) {
    // Skip if already in the static list
    if (AVAILABLE_MODELS.some(m => m.id === name)) continue;

    ollamaModels.push({
      id: name,
      name: name,
      provider: 'ollama',
      maxTokens: 4096,
      contextWindow: 128000, // conservative default
    });
  }
}
