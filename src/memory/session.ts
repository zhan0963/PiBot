import { Message, Session } from '../types/index.js';
import { SessionStorage } from './storage.js';
import { randomUUID } from 'crypto';

export class SessionManager {
  private sessions = new Map<string, Session>();

  constructor(private storage: SessionStorage) {}

  async initialize(): Promise<void> {
    await this.storage.initialize();
  }

  private generateSessionId(userId: string, channelId?: string): string {
    return channelId ? `${userId}-${channelId}` : userId;
  }

  async getOrCreateSession(
    userId: string,
    channelId: string | undefined,
    model: string
  ): Promise<Session> {
    const sessionId = this.generateSessionId(userId, channelId);

    // Check in-memory cache
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    // Try to load from disk (keep the saved model, only use default as fallback)
    const existingSession = await this.storage.loadSession(sessionId);
    if (existingSession) {
      if (!existingSession.model) {
        existingSession.model = model;
      }
      this.sessions.set(sessionId, existingSession);
      return existingSession;
    }

    // Create new session
    const newSession: Session = {
      id: sessionId,
      userId,
      channelId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model,
    };

    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  async addMessage(
    userId: string,
    channelId: string | undefined,
    message: Omit<Message, 'id' | 'timestamp'>
  ): Promise<Message> {
    const sessionId = this.generateSessionId(userId, channelId);
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found. Call getOrCreateSession first.');
    }

    const fullMessage: Message = {
      ...message,
      id: randomUUID(),
      timestamp: Date.now(),
      userId,
      channelId,
    };

    session.messages.push(fullMessage);
    session.updatedAt = fullMessage.timestamp;

    await this.storage.appendMessage(sessionId, fullMessage);

    return fullMessage;
  }

  async clearSession(userId: string, channelId?: string): Promise<void> {
    const sessionId = this.generateSessionId(userId, channelId);
    this.sessions.delete(sessionId);
    await this.storage.clearSession(sessionId);
  }

  async updateSessionModel(
    userId: string,
    channelId: string | undefined,
    model: string
  ): Promise<void> {
    const sessionId = this.generateSessionId(userId, channelId);
    let session = this.sessions.get(sessionId);

    if (!session) {
      // Load from disk or create a new session so the model switch persists
      session = await this.getOrCreateSession(userId, channelId, model);
    }

    session.model = model;
  }
}
