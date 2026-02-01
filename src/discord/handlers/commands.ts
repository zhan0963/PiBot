import { Message as DiscordMessage } from 'discord.js';
import { SessionManager } from '../../memory/session.js';
import { AVAILABLE_MODELS, getModelsByProvider, LLMProvider } from '../../config/models.js';

// Use '!' prefix to avoid conflicts with Discord's native slash commands
const COMMAND_PREFIX = '!';

export class CommandHandler {
  constructor(private sessionManager: SessionManager) {}

  async handleCommand(message: DiscordMessage): Promise<boolean> {
    const content = message.content.trim();

    // Also handle commands when bot is mentioned: "@PiBot !help"
    const cleanContent = content.replace(/<@!?\d+>/g, '').trim();

    if (!cleanContent.startsWith(COMMAND_PREFIX)) return false;

    const [command, ...args] = cleanContent.slice(COMMAND_PREFIX.length).split(/\s+/);

    switch (command.toLowerCase()) {
      case 'clear':
        await this.handleClear(message);
        return true;

      case 'model':
        await this.handleModel(message, args);
        return true;

      case 'models':
        await this.handleModels(message);
        return true;

      case 'help':
        await this.handleHelp(message);
        return true;

      default:
        return false;
    }
  }

  private async handleClear(message: DiscordMessage): Promise<void> {
    const userId = message.author.id;
    const channelId = message.channel.isDMBased() ? undefined : message.channel.id;

    await this.sessionManager.clearSession(userId, channelId);
    await message.reply('✅ Conversation history cleared!');
  }

  private async handleModel(
    message: DiscordMessage,
    args: string[]
  ): Promise<void> {
    if (args.length === 0) {
      await message.reply(`Usage: \`${COMMAND_PREFIX}model <model-id>\` — Use \`${COMMAND_PREFIX}models\` to see available models.`);
      return;
    }

    if (args[0] === 'list') {
      await this.handleModels(message);
      return;
    }

    const modelId = args.join(' ');
    const model = AVAILABLE_MODELS.find(m =>
      m.id === modelId || m.name.toLowerCase() === modelId.toLowerCase()
    );

    if (!model) {
      // Could be a custom Ollama model not in our registry — allow it anyway
      const userId = message.author.id;
      const channelId = message.channel.isDMBased() ? undefined : message.channel.id;

      await this.sessionManager.updateSessionModel(userId, channelId, modelId);
      await message.reply(`✅ Model switched to: \`${modelId}\` (custom — will route to Ollama)`);
      return;
    }

    const userId = message.author.id;
    const channelId = message.channel.isDMBased() ? undefined : message.channel.id;

    await this.sessionManager.updateSessionModel(userId, channelId, model.id);

    const providerLabel = model.provider === 'anthropic' ? '☁️ Anthropic' : '🏠 Ollama';
    await message.reply(`✅ Model switched to: **${model.name}** (\`${model.id}\`) — ${providerLabel}`);
  }

  private async handleModels(message: DiscordMessage): Promise<void> {
    const providers: { key: LLMProvider; label: string; emoji: string }[] = [
      { key: 'anthropic', label: 'Anthropic (Cloud)', emoji: '☁️' },
      { key: 'ollama', label: 'Ollama (Local)', emoji: '🏠' },
    ];

    let output = '**Available Models:**\n';

    for (const provider of providers) {
      const models = getModelsByProvider(provider.key);
      if (models.length === 0) continue;

      output += `\n${provider.emoji} **${provider.label}**\n`;
      for (const m of models) {
        output += `• **${m.name}** (\`${m.id}\`)\n  Context: ${m.contextWindow.toLocaleString()} tokens | Max output: ${m.maxTokens.toLocaleString()} tokens\n`;
      }
    }

    output += `\n💡 *Tip: You can also use any Ollama model by name, e.g. \`${COMMAND_PREFIX}model codellama\`*`;

    await message.reply(output);
  }

  private async handleHelp(message: DiscordMessage): Promise<void> {
    const helpText = `
**PiBot Commands:**

\`${COMMAND_PREFIX}help\` — Show this help message
\`${COMMAND_PREFIX}clear\` — Clear conversation history
\`${COMMAND_PREFIX}model <id>\` — Switch AI model (supports Anthropic & Ollama)
\`${COMMAND_PREFIX}models\` — List available models

**Usage:**
• Mention me (@PiBot) in a channel to chat
• DM me directly for private conversations
• I remember our conversation history!

**Providers:**
☁️ Anthropic (Claude) — Cloud-based AI
🏠 Ollama — Local models on your machine
    `.trim();

    await message.reply(helpText);
  }
}
