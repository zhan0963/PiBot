import { Message as DiscordMessage } from 'discord.js';
import { SessionManager } from '../../memory/session.js';
import { AVAILABLE_MODELS, getModelById } from '../../config/models.js';

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
      await message.reply(`❌ Model not found. Use \`${COMMAND_PREFIX}models\` to see available models.`);
      return;
    }

    const userId = message.author.id;
    const channelId = message.channel.isDMBased() ? undefined : message.channel.id;

    // Update the session model
    await this.sessionManager.updateSessionModel(userId, channelId, model.id);

    await message.reply(`✅ Model switched to: **${model.name}** (\`${model.id}\`)`);
  }

  private async handleModels(message: DiscordMessage): Promise<void> {
    const modelList = AVAILABLE_MODELS.map(m =>
      `• **${m.name}** (\`${m.id}\`)\n  Context: ${m.contextWindow.toLocaleString()} tokens | Max output: ${m.maxTokens.toLocaleString()} tokens`
    ).join('\n\n');

    await message.reply(`**Available Models:**\n\n${modelList}`);
  }

  private async handleHelp(message: DiscordMessage): Promise<void> {
    const helpText = `
**PiBot Commands:**

\`${COMMAND_PREFIX}help\` — Show this help message
\`${COMMAND_PREFIX}clear\` — Clear conversation history
\`${COMMAND_PREFIX}model <id>\` — Switch AI model
\`${COMMAND_PREFIX}models\` — List available models

**Usage:**
• Mention me (@PiBot) in a channel to chat
• DM me directly for private conversations
• I remember our conversation history!
    `.trim();

    await message.reply(helpText);
  }
}
