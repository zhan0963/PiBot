import dotenv from 'dotenv';
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
  ollama: {
    enabled: boolean;
    baseUrl: string;
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
    ollama: {
      enabled: process.env.OLLAMA_ENABLED !== 'false', // enabled by default
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
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
  // Only require Anthropic API key if Ollama is not enabled (need at least one provider)
  if (!config.anthropic.apiKey && !config.ollama.enabled) {
    throw new Error('ANTHROPIC_API_KEY is required when Ollama is not enabled');
  }
}
