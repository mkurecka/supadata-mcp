# Supadata MCP Server

MCP server for integrating with Supadata's transcript API, enabling AI assistants to get transcripts from video and audio content.

## Features

- Get transcripts from YouTube, TikTok, X/Twitter videos
- Support for audio files (MP4, WEBM, MP3, etc.)
- Multiple transcript modes (native, AI-generated, auto)
- Language selection and detection
- Both plain text and detailed segment formats
- JSON-based configuration (no tool configuration needed)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Configure your API key:
```bash
cp supadata-config.json.example supadata-config.json
# Edit supadata-config.json with your API key from https://supadata.ai
```

## Configuration

Create `supadata-config.json` in the project root:

```json
{
  "apiKey": "your-supadata-api-key-here",
  "baseUrl": "https://api.supadata.ai/v1"
}
```

The server will look for configuration files in this order:
1. `./supadata-config.json` (current working directory)
2. `../supadata-config.json` (parent of dist directory)
3. `./dist/supadata-config.json` (alongside compiled files)

## Usage

Configure the MCP server in your AI assistant:

```json
{
  "mcpServers": {
    "supadata": {
      "command": "node",
      "args": ["/path/to/supadata-mcp/dist/index.js"]
    }
  }
}
```

## Tools

### get_transcript
Get transcript from video or audio content.

**Parameters:**
- `url` (required): Video or audio file URL
- `lang` (optional): Preferred language code
- `text` (optional): Return plain text instead of segments (default: false)  
- `mode` (optional): 'native', 'generate', or 'auto' (default: 'auto')

## Development

```bash
npm run dev     # Build and run
npm run watch   # Watch mode
npm run lint    # Lint code
npm run typecheck # Type checking
```