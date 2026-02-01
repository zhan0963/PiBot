import { Session, Message } from '../types/index.js';

export interface ContextOptions {
  maxMessages?: number;
  systemPrompt?: string;
}

export function buildContext(
  session: Session,
  options: ContextOptions = {}
): Message[] {
  const { maxMessages = 50, systemPrompt } = options;

  const messages = [...session.messages];

  // Keep only recent messages to fit context window
  const recentMessages = messages.slice(-maxMessages);

  // Add system prompt if provided
  if (systemPrompt) {
    return [
      {
        id: 'system',
        role: 'system',
        content: systemPrompt,
        timestamp: Date.now(),
      },
      ...recentMessages,
    ];
  }

  return recentMessages;
}
