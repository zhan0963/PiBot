export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  userId?: string;
  channelId?: string;
}

export interface Session {
  id: string;
  userId: string;
  channelId?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
