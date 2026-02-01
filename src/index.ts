import { loadConfig, validateConfig } from './config/config.js';
import { SessionStorage } from './memory/storage.js';
import { SessionManager } from './memory/session.js';
import { AnthropicClient } from './llm/anthropic.js';
import { DiscordBot } from './discord/bot.js';

async function main() {
  console.log('🤖 Starting PiBot...');

  // Load and validate configuration
  const config = loadConfig();
  validateConfig(config);

  console.log(`📦 Default model: ${config.anthropic.defaultModel}`);
  console.log(`💾 Data directory: ${config.storage.dataDir}`);

  // Initialize memory system
  const storage = new SessionStorage(config.storage.sessionsDir);
  const sessionManager = new SessionManager(storage);
  await sessionManager.initialize();

  console.log('✅ Memory system initialized');

  // Initialize LLM client
  const llmClient = new AnthropicClient(config.anthropic.apiKey);

  console.log('✅ LLM client initialized');

  // Initialize and start Discord bot
  const bot = new DiscordBot(
    config.discord.token,
    sessionManager,
    llmClient,
    config.anthropic.defaultModel
  );

  await bot.start();

  console.log('✅ PiBot is running!');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down PiBot...');
    await bot.stop();
    console.log('👋 Goodbye!');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
