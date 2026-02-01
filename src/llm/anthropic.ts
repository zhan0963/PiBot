import Anthropic from '@anthropic-ai/sdk';
import { LLMClient } from './client.js';
import { Message, LLMResponse } from '../types/index.js';
import { getModelById } from '../config/models.js';

export class AnthropicClient implements LLMClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(messages: Message[], model: string): Promise<LLMResponse> {
    // Convert messages to Anthropic format
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Extract system prompt if exists
    const systemMessage = messages.find(m => m.role === 'system');
    const system = systemMessage?.content;

    // Use per-model maxTokens instead of hardcoded value
    const modelConfig = getModelById(model);
    const maxTokens = modelConfig?.maxTokens ?? 4096;

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: anthropicMessages,
    });

    return {
      content: response.content[0].type === 'text'
        ? response.content[0].text
        : '',
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
