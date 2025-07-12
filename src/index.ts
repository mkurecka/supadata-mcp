#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SupadataClient } from './supadata-client.js';
import { TranscriptRequest, SupadataConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SupadataMCPServer {
  private server: Server;
  private supadata: SupadataClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'supadata-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.loadConfiguration();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private loadConfiguration(): void {
    // First try environment variable
    const envApiKey = process.env.SUPADATA_API_KEY;
    if (envApiKey) {
      const config: SupadataConfig = {
        apiKey: envApiKey,
        baseUrl: process.env.SUPADATA_BASE_URL || 'https://api.supadata.ai/v1'
      };
      this.supadata = new SupadataClient(config);
      console.error('Loaded Supadata configuration from environment variables');
      return;
    }

    // Fallback to JSON config files
    const configPaths = [
      join(process.cwd(), 'supadata-config.json'),
      join(__dirname, '..', 'supadata-config.json'),
      join(__dirname, 'supadata-config.json'),
    ];

    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          const configData = readFileSync(configPath, 'utf-8');
          const config: SupadataConfig = JSON.parse(configData);
          
          if (!config.apiKey) {
            throw new Error('API key is required in configuration');
          }
          
          this.supadata = new SupadataClient(config);
          console.error(`Loaded Supadata configuration from: ${configPath}`);
          return;
        } catch (error) {
          console.error(`Failed to load config from ${configPath}:`, error);
        }
      }
    }

    console.error('Warning: No Supadata configuration found. Set SUPADATA_API_KEY environment variable or create supadata-config.json.');
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_transcript',
            description: 'Get transcript from video URL (YouTube, TikTok, X/Twitter) or audio file',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'Video or audio file URL to transcribe',
                },
                lang: {
                  type: 'string',
                  description: 'Preferred language code (optional)',
                },
                text: {
                  type: 'boolean',
                  description: 'Return plain text transcript instead of detailed segments (default: false)',
                  default: false,
                },
                mode: {
                  type: 'string',
                  enum: ['native', 'generate', 'auto'],
                  description: 'Transcript mode: native (existing only), generate (AI only), auto (try native first)',
                  default: 'auto',
                },
              },
              required: ['url'],
            },
          },
        ] satisfies Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_transcript':
            return await this.handleGetTranscript(args || {});
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            } satisfies TextContent,
          ],
          isError: true,
        } satisfies CallToolResult;
      }
    });
  }


  private async handleGetTranscript(args: Record<string, unknown>): Promise<CallToolResult> {
    if (!this.supadata) {
      throw new Error('Supadata API not configured. Please create supadata-config.json with your API key.');
    }

    const request: TranscriptRequest = {
      url: args.url as string,
      lang: args.lang as string | undefined,
      text: (args.text as boolean) ?? false,
      mode: (args.mode as 'native' | 'generate' | 'auto') ?? 'auto',
    };

    if (!request.url || typeof request.url !== 'string') {
      throw new Error('URL is required and must be a string');
    }

    const result = await this.supadata.getTranscript(request);

    const responseText = request.text
      ? `Transcript (${result.lang}):\n\n${(result as { content: string }).content}`
      : `Transcript (${result.lang}) with ${(result as { content: Array<{ text: string; offset: number }> }).content.length} segments:\n\n${(result as { content: Array<{ text: string; offset: number }> }).content
          .map((seg) => 
            `[${Math.floor(seg.offset / 1000)}s] ${seg.text}`
          )
          .join('\n')}`;

    const availableLangs = result.availableLangs?.length 
      ? `\n\nAvailable languages: ${result.availableLangs.join(', ')}`
      : '';

    return {
      content: [
        {
          type: 'text',
          text: responseText + availableLangs,
        } satisfies TextContent,
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new SupadataMCPServer();
server.run().catch(console.error);