import { LLMClient } from './client.js';
import { Message, LLMResponse } from '../types/index.js';

interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class OllamaClient implements LLMClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    // Remove trailing slash if present
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async chat(messages: Message[], model: string): Promise<LLMResponse> {
    // Convert to OpenAI-compatible chat format
    // Ollama natively supports system/user/assistant roles
    const chatMessages: OllamaChatMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Ollama API error (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as OllamaChatResponse;

    const content = data.choices?.[0]?.message?.content ?? '';

    return {
      content,
      model: data.model ?? model,
      usage: data.usage
        ? {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
          }
        : undefined,
    };
  }

  /**
   * Check if Ollama is reachable
   */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * List models currently available in Ollama
   */
  async listModels(): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (!res.ok) return [];
      const data = (await res.json()) as { models: Array<{ name: string }> };
      return data.models?.map(m => m.name) ?? [];
    } catch {
      return [];
    }
  }
}
