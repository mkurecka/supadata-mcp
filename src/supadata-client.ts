import { SupadataConfig, TranscriptRequest, TranscriptResponse, SupadataError } from './types.js';

export class SupadataClient {
  private config: SupadataConfig;

  constructor(config: SupadataConfig) {
    this.config = {
      baseUrl: 'https://api.supadata.ai/v1',
      ...config
    };
  }

  async getTranscript(request: TranscriptRequest): Promise<TranscriptResponse> {
    const url = new URL(`${this.config.baseUrl}/transcript`);
    
    url.searchParams.append('url', request.url);
    
    if (request.lang) {
      url.searchParams.append('lang', request.lang);
    }
    
    if (request.text !== undefined) {
      url.searchParams.append('text', request.text.toString());
    }
    
    if (request.mode) {
      url.searchParams.append('mode', request.mode);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData: SupadataError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(`Supadata API error: ${errorData.error || errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }
}