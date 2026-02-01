import { loadConfig, validateConfig } from './config/config.js';
import { SessionStorage } from './memory/storage.js';
import { SessionManager } from './memory/session.js';
import { AnthropicClient } from './llm/anthropic.js';
import { OllamaClient } from './llm/ollama.js';
import { LLMRouter } from './llm/router.js';
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

  // Initialize LLM clients
  const anthropicClient = config.anthropic.apiKey
    ? new AnthropicClient(config.anthropic.apiKey)
    : null;

  if (anthropicClient) {
    console.log('✅ Anthropic client initialized');
  }

  let ollamaClient: OllamaClient | null = null;
  if (config.ollama.enabled) {
    ollamaClient = new OllamaClient(config.ollama.baseUrl);
    const available = await ollamaClient.isAvailable();
    if (available) {
      const models = await ollamaClient.listModels();
      console.log(`✅ Ollama client initialized (${config.ollama.baseUrl}) — ${models.length} model(s) available`);
    } else {
      console.warn(`⚠️  Ollama enabled but not reachable at ${config.ollama.baseUrl}`);
    }
  }

  // Create router that dispatches to the right provider
  const llmRouter = new LLMRouter({
    anthropicClient,
    ollamaClient,
  });

  console.log('✅ LLM router initialized');

  // Initialize and start Discord bot
  const bot = new DiscordBot(
    config.discord.token,
    sessionManager,
    llmRouter,
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
