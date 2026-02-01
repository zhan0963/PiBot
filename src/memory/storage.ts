import { promises as fs } from 'fs';
import path from 'path';
import { Message, Session } from '../types/index.js';

export class SessionStorage {
  constructor(private sessionsDir: string) {}

  async initialize(): Promise<void> {
    await fs.mkdir(this.sessionsDir, { recursive: true });
  }

  private getSessionPath(sessionId: string): string {
    return path.join(this.sessionsDir, `${sessionId}.jsonl`);
  }

  async loadSession(sessionId: string): Promise<Session | null> {
    const sessionPath = this.getSessionPath(sessionId);

    try {
      const content = await fs.readFile(sessionPath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);

      if (lines.length === 0) return null;

      const messages: Message[] = lines.map(line => JSON.parse(line));
      const firstMessage = messages[0];

      return {
        id: sessionId,
        userId: firstMessage.userId || '',
        channelId: firstMessage.channelId,
        messages,
        createdAt: messages[0].timestamp,
        updatedAt: messages[messages.length - 1].timestamp,
        model: '', // Will be set from config
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null; // Session doesn't exist yet
      }
      throw error;
    }
  }

  async appendMessage(sessionId: string, message: Message): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId);
    const line = JSON.stringify(message) + '\n';
    await fs.appendFile(sessionPath, line, 'utf-8');
  }

  async clearSession(sessionId: string): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId);
    try {
      await fs.unlink(sessionPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
