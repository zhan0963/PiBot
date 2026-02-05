import { Message as DiscordMessage } from 'discord.js';
import { SessionManager } from '../../memory/session.js';
import { LLMClient } from '../../llm/client.js';
import { buildContext } from '../../memory/context.js';

const SYSTEM_PROMPT = 
`
You are PiBot, a helpful AI assistant running on a Raspberry Pi. 
You are friendly, concise, and helpful. 
You remember previous conversations with the user.
`;

export class MessageHandler {
  constructor(
    private sessionManager: SessionManager,
    private llmClient: LLMClient,
    private defaultModel: string
  ) {}

  async handleMessage(message: DiscordMessage): Promise<void> {
    // Ignore bot messages
    if (message.author.bot) return;

    // Only respond to mentions or DMs
    const isMentioned = message.mentions.has(message.client.user!);
    const isDM = message.channel.isDMBased();

    if (!isMentioned && !isDM) return;

    // Ensure channel supports sending messages
    const channel = message.channel;
    if (!('send' in channel) || !('sendTyping' in channel)) return;

    try {
      // Start typing indicator with auto-refresh (expires after ~10s)
      const sendTyping = () => (channel as any).sendTyping().catch(() => {});
      const typingInterval = setInterval(sendTyping, 8000);
      await sendTyping();

      try {
        const userId = message.author.id;
        const channelId = isDM ? undefined : message.channel.id;

        // Get or create session
        const session = await this.sessionManager.getOrCreateSession(
          userId,
          channelId,
          this.defaultModel
        );

        // Clean message content: strip bot mentions
        const cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();

        if (!cleanContent) {
          await message.reply('Hey! How can I help you? Try asking me something.');
          return;
        }

        // Add user message to session
        await this.sessionManager.addMessage(userId, channelId, {
          role: 'user',
          content: cleanContent,
        });

        // Build context and get LLM response
        const context = buildContext(session, {
          systemPrompt: SYSTEM_PROMPT,
        });

        const response = await this.llmClient.chat(context, session.model);

        // Add assistant message to session
        await this.sessionManager.addMessage(userId, channelId, {
          role: 'assistant',
          content: response.content,
        });

        // Send response (split if too long)
        await this.sendResponse(message, response.content);

        console.log(
          `[Chat] ${message.author.tag} | Model: ${response.model} | ` +
          `Tokens: ${response.usage?.inputTokens ?? '?'}in/${response.usage?.outputTokens ?? '?'}out`
        );
      } finally {
        clearInterval(typingInterval);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await message.reply('Sorry, I encountered an error processing your message. Please try again.');
    }
  }

  private async sendResponse(
    message: DiscordMessage,
    content: string
  ): Promise<void> {
    // Discord has a 2000 character limit
    const chunks = this.splitMessage(content, 2000);

    for (let i = 0; i < chunks.length; i++) {
      if (i === 0) {
        await message.reply(chunks[i]);
      } else {
        // Follow-up chunks sent as regular messages in the same channel
        if ('send' in message.channel) {
          await (message.channel as any).send(chunks[i]);
        }
      }
    }
  }

  private splitMessage(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining);
        break;
      }

      // Try to split at a newline
      let splitIndex = remaining.lastIndexOf('\n', maxLength);
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        // Try to split at a space
        splitIndex = remaining.lastIndexOf(' ', maxLength);
      }
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        // Force split at maxLength
        splitIndex = maxLength;
      }

      chunks.push(remaining.slice(0, splitIndex));
      remaining = remaining.slice(splitIndex).trim();
    }

    return chunks;
  }
}
