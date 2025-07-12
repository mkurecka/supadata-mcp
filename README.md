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

### Option 1: Environment Variables (Recommended)
Set environment variables (useful for MCP server configuration):

```bash
export SUPADATA_API_KEY="your-supadata-api-key-here"
export SUPADATA_BASE_URL="https://api.supadata.ai/v1"  # optional
```

### Option 2: JSON Configuration File
Create `supadata-config.json` in the project root:

```json
{
  "apiKey": "your-supadata-api-key-here",
  "baseUrl": "https://api.supadata.ai/v1"
}
```

The server will look for configuration in this order:
1. Environment variables (`SUPADATA_API_KEY`, `SUPADATA_BASE_URL`)
2. `./supadata-config.json` (current working directory)
3. `../supadata-config.json` (parent of dist directory)
4. `./dist/supadata-config.json` (alongside compiled files)

## Usage

### Option 1: Desktop Extension (Recommended)

**One-click installation:**
1. Download `supadata-mcp.dxt` from releases
2. Double-click to open with Claude Desktop
3. Enter your Supadata API key when prompted
4. Click "Install"

**Build extension yourself:**
```bash
npm run package
# Creates supadata-mcp.dxt file
```

### Option 2: Manual MCP Configuration

Add to your Claude app's MCP server configuration:

```json
{
  "mcpServers": {
    "supadata": {
      "command": "node",
      "args": ["/path/to/supadata-mcp/dist/index.js"],
      "env": {
        "SUPADATA_API_KEY": "your-supadata-api-key-here"
      }
    }
  }
}
```

### Option 3: Without Environment Variables
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
*(Requires supadata-config.json file)*

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
npm run dev           # Build and run
npm run watch         # Watch mode  
npm run lint          # Lint code
npm run typecheck     # Type checking
npm run package       # Build desktop extension (.dxt)
npm run build-extension # Alias for package
```

## Desktop Extension Features

- **One-click installation** - No complex setup required
- **Secure API key storage** - Stored in OS keychain
- **Cross-platform support** - Works on macOS, Windows, Linux
- **Automatic updates** - Extension updates managed by Claude Desktop
- **User-friendly configuration** - GUI prompts for API key

## Files

- `manifest.json` - Desktop extension configuration
- `build-extension.js` - Packaging script for .dxt creation
- `supadata-mcp.dxt` - Packaged extension (generated)
- `src/` - TypeScript source code
- `dist/` - Compiled JavaScript (generated)