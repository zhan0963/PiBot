import { LLMClient } from './client.js';
import { AnthropicClient } from './anthropic.js';
import { OllamaClient } from './ollama.js';
import { Message, LLMResponse } from '../types/index.js';
import { getModelById } from '../config/models.js';

export class LLMRouter implements LLMClient {
  private anthropicClient: AnthropicClient | null;
  private ollamaClient: OllamaClient | null;

  constructor(options: {
    anthropicClient?: AnthropicClient | null;
    ollamaClient?: OllamaClient | null;
  }) {
    this.anthropicClient = options.anthropicClient ?? null;
    this.ollamaClient = options.ollamaClient ?? null;
  }

  async chat(messages: Message[], model: string): Promise<LLMResponse> {
    const client = this.resolveClient(model);
    return client.chat(messages, model);
  }

  private resolveClient(model: string): LLMClient {
    // First, check the model registry for an explicit provider
    const modelConfig = getModelById(model);
    const provider = modelConfig?.provider;

    if (provider === 'anthropic') {
      if (!this.anthropicClient) {
        throw new Error(`Anthropic provider is not configured. Set ANTHROPIC_API_KEY.`);
      }
      return this.anthropicClient;
    }

    if (provider === 'ollama') {
      if (!this.ollamaClient) {
        throw new Error(`Ollama provider is not configured. Set OLLAMA_ENABLED=true.`);
      }
      return this.ollamaClient;
    }

    // Fallback heuristic: if model ID starts with "claude", use Anthropic
    if (model.startsWith('claude')) {
      if (!this.anthropicClient) {
        throw new Error(`Anthropic provider is not configured. Set ANTHROPIC_API_KEY.`);
      }
      return this.anthropicClient;
    }

    // Default to Ollama for unknown models (likely local models)
    if (this.ollamaClient) {
      return this.ollamaClient;
    }

    // Last resort: try Anthropic
    if (this.anthropicClient) {
      return this.anthropicClient;
    }

    throw new Error(`No LLM provider available for model: ${model}`);
  }
}
