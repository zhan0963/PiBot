import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

dotenv.config();

export interface BotConfig {
  discord: {
    token: string;
  };
  anthropic: {
    apiKey: string;
    defaultModel: string;
  };
  storage: {
    dataDir: string;
    sessionsDir: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

export function loadConfig(): BotConfig {
  const dataDir = process.env.DATA_DIR || './data';

  return {
    discord: {
      token: process.env.DISCORD_TOKEN || '',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      defaultModel: process.env.DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
    },
    storage: {
      dataDir,
      sessionsDir: path.join(dataDir, 'sessions'),
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
    },
  };
}

// Validate configuration
export function validateConfig(config: BotConfig): void {
  if (!config.discord.token) {
    throw new Error('DISCORD_TOKEN is required');
  }
  if (!config.anthropic.apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }
}