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

  // --- Ollama models (common defaults) ---
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    provider: 'ollama',
    maxTokens: 4096,
    contextWindow: 128000,
  },
  {
    id: 'llama3.1',
    name: 'Llama 3.1',
    provider: 'ollama',
    maxTokens: 4096,
    contextWindow: 128000,
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    provider: 'ollama',
    maxTokens: 4096,
    contextWindow: 32000,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'ollama',
    maxTokens: 4096,
    contextWindow: 64000,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'ollama',
    maxTokens: 4096,
    contextWindow: 32000,
  },
  {
    id: 'gemma2',
    name: 'Gemma 2',
    provider: 'ollama',
    maxTokens: 4096,
    contextWindow: 8192,
  },
  {
    id: 'phi3',
    name: 'Phi-3',
    provider: 'ollama',
    maxTokens: 4096,
    contextWindow: 128000,
  },
];

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}

export function getModelsByProvider(provider: LLMProvider): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.provider === provider);
}
