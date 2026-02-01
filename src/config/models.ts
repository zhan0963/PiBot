export interface ModelConfig {
  id: string;
  name: string;
  maxTokens: number;
  contextWindow: number;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    maxTokens: 8192,
    contextWindow: 200000,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    maxTokens: 4096,
    contextWindow: 200000,
  },
];

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}
