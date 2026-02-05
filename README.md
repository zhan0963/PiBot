# PiBot

A Discord chatbot powered by AI, designed to run on a Raspberry Pi (or any server). Supports both **Anthropic Claude** and **Ollama** local models with persistent conversation memory.

## Features

- **Dual LLM Support**: Use Anthropic Claude API or local Ollama models
- **Automatic Model Discovery**: Ollama models are detected automatically at startup
- **Persistent Memory**: Conversations are saved per user/channel using file-based storage
- **Flexible Routing**: Automatically routes requests to the correct provider
- **Discord Integration**: Responds to mentions and direct messages

## Roadmap

- [ ] Camera integration for Raspberry Pi vision
- [ ] Voice chat support
- [ ] Coding assistance on Pi
- [ ] System automation tasks on Pi

## Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **Discord Bot Token** - [Create one here](https://discord.com/developers/applications)
- **LLM Provider** (at least one):
  - [Anthropic API Key](https://console.anthropic.com/) for Claude models
  - [Ollama](https://ollama.ai/) installed locally or on a network server

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PiBot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Configuration](#configuration) below)

4. **Run the bot**
   ```bash
   # Development mode (with hot reload)
   pnpm dev

   # Production mode
   pnpm build
   pnpm start
   ```

## Configuration

Create a `.env` file in the project root with the following variables:

### Required

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Your Discord bot token |

### LLM Providers (at least one required)

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude models | - |
| `OLLAMA_ENABLED` | Enable Ollama local models | `true` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |

### Bot Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `DEFAULT_MODEL` | Default model to use (see [Available Models](#available-models)) | `claude-3-5-haiku-20241022` |
| `DATA_DIR` | Directory for conversation storage | `./data` |
| `LOG_LEVEL` | Logging level (`debug`, `info`, `warn`, `error`) | `info` |

### Example `.env` file

```env
# Discord Bot Token
DISCORD_TOKEN=your_discord_token_here

# Anthropic API Key (optional if using Ollama)
ANTHROPIC_API_KEY=your_anthropic_key_here

# Bot Configuration
DEFAULT_MODEL=llama3.2
DATA_DIR=./data
LOG_LEVEL=info

# Ollama Configuration
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
```

## Available Models

### Anthropic Claude Models

| Model ID | Name | Max Tokens |
|----------|------|------------|
| `claude-sonnet-4-20250514` | Claude Sonnet 4 | 8192 |
| `claude-3-5-sonnet-20241022` | Claude 3.5 Sonnet | 8192 |
| `claude-3-5-haiku-20241022` | Claude 3.5 Haiku | 8192 |
| `claude-3-opus-20240229` | Claude 3 Opus | 4096 |

### Ollama Models

Ollama models are **automatically discovered** at startup. Any model you have installed in Ollama will be available to use.

## Setting Up Ollama

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:** Download from [ollama.ai](https://ollama.ai/)

### 2. Pull a Model

```bash
# Popular models for chatbots
ollama pull llama3.2          # Meta's Llama 3.2 (lightweight, fast)
ollama pull llama3.1:8b       # Llama 3.1 8B
ollama pull mistral           # Mistral 7B
ollama pull qwen2.5:7b        # Qwen 2.5 7B
ollama pull deepseek-r1:8b    # DeepSeek R1 8B

# List installed models
ollama list
```

### 3. Start Ollama Server

Ollama typically runs automatically as a service. To start manually:
```bash
ollama serve
```

### 4. Configure PiBot

Set your preferred Ollama model in `.env`:
```env
DEFAULT_MODEL=llama3.2
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
```

### Remote Ollama Server

To use Ollama running on another machine (e.g., a more powerful server):

1. On the Ollama server, allow external connections:
   ```bash
   OLLAMA_HOST=0.0.0.0 ollama serve
   ```

2. Configure PiBot to use the remote server:
   ```env
   OLLAMA_BASE_URL=http://192.168.1.100:11434
   ```

### Recommended Models by Use Case

| Use Case | Recommended Model | Notes |
|----------|-------------------|-------|
| **Raspberry Pi (limited RAM)** | `llama3.2:1b`, `qwen2.5:0.5b` | Small models for 4GB RAM |
| **General chatbot** | `llama3.2`, `mistral` | Good balance of speed and quality |
| **High quality responses** | `llama3.1:70b`, `qwen2.5:32b` | Requires powerful hardware |
| **Coding assistance** | `deepseek-coder`, `codellama` | Optimized for code |

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and give it a name
3. Go to **Bot** section and click **Add Bot**
4. Copy the **Token** and add it to your `.env` file
5. Enable these **Privileged Gateway Intents**:
   - Message Content Intent
   - Server Members Intent (optional)
6. Go to **OAuth2 > URL Generator**:
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Read Message History`, `View Channels`
7. Copy the generated URL and open it to invite the bot to your server

## Usage

Once the bot is running and invited to your server:

- **Mention the bot**: `@PiBot hello!`
- **Direct message**: Send a DM to the bot

The bot will respond using the configured default model and remember your conversation history.

## Project Structure

```
PiBot/
├── src/
│   ├── config/
│   │   ├── config.ts      # Environment configuration
│   │   └── models.ts      # Model definitions & registry
│   ├── llm/
│   │   ├── client.ts      # LLM client interface
│   │   ├── anthropic.ts   # Anthropic Claude client
│   │   ├── ollama.ts      # Ollama client
│   │   └── router.ts      # Provider router
│   ├── discord/
│   │   ├── bot.ts         # Discord bot setup
│   │   └── handlers/      # Message & command handlers
│   ├── memory/
│   │   ├── context.ts     # Conversation context builder
│   │   ├── session.ts     # Session management
│   │   └── storage.ts     # File-based persistence
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   └── index.ts           # Entry point
├── data/                  # Conversation storage (created at runtime)
├── .env                   # Configuration (create from .env.example)
├── .env.example           # Configuration template
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run in development mode with hot reload |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm start` | Run compiled production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |

## Troubleshooting

### Bot doesn't respond
- Ensure **Message Content Intent** is enabled in Discord Developer Portal
- Check that the bot has permissions to read and send messages in the channel

### Ollama connection failed
- Verify Ollama is running: `ollama list`
- Check the `OLLAMA_BASE_URL` is correct
- For remote servers, ensure the port (11434) is accessible

### Out of memory (Raspberry Pi)
- Use smaller models like `llama3.2:1b` or `qwen2.5:0.5b`
- Increase swap space on your Pi
- Consider running Ollama on a separate, more powerful machine

## License

ISC
