import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import { MessageHandler } from './handlers/message.js';
import { CommandHandler } from './handlers/commands.js';
import { SessionManager } from '../memory/session.js';
import { LLMClient } from '../llm/client.js';

export class DiscordBot {
  private client: Client;
  private messageHandler: MessageHandler;
  private commandHandler: CommandHandler;

  constructor(
    private token: string,
    sessionManager: SessionManager,
    llmClient: LLMClient,
    defaultModel: string
  ) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      // Required for DM support
      partials: [Partials.Channel, Partials.Message],
    });

    this.messageHandler = new MessageHandler(
      sessionManager,
      llmClient,
      defaultModel
    );
    this.commandHandler = new CommandHandler(sessionManager);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on(Events.ClientReady, (readyClient) => {
      console.log(`✅ Logged in as ${readyClient.user.tag}`);
      console.log(`📡 Serving ${readyClient.guilds.cache.size} server(s)`);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      // Ignore bot messages
      if (message.author.bot) return;

      try {
        // Try to handle as command first
        const isCommand = await this.commandHandler.handleCommand(message);

        // If not a command, handle as regular message
        if (!isCommand) {
          await this.messageHandler.handleMessage(message);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    this.client.on(Events.Error, (error) => {
      console.error('Discord client error:', error);
    });

    // Handle reconnection
    this.client.on(Events.Warn, (warning) => {
      console.warn('Discord warning:', warning);
    });
  }

  async start(): Promise<void> {
    await this.client.login(this.token);
  }

  async stop(): Promise<void> {
    console.log('Disconnecting from Discord...');
    this.client.destroy();
  }
}
