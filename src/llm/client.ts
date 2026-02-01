import { Message, LLMResponse } from '../types/index.js';

export interface LLMClient {
  chat(messages: Message[], model: string): Promise<LLMResponse>;
}
