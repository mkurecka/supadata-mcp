import { SupadataConfig, TranscriptRequest, TranscriptResponse, SupadataError } from './types.js';
import fetch from 'node-fetch';

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
        'x-api-key': this.config.apiKey
      }
    });

    if (!response.ok) {
      const errorData: SupadataError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      })) as SupadataError;
      
      // Provide helpful error messages for common issues
      let errorMessage = errorData.error || errorData.message || 'Unknown error';
      
      if (errorMessage.includes('upgrade-required')) {
        errorMessage = `Account upgrade required. Your current plan may not support this feature. Check your plan limits at https://supadata.ai/pricing. Original error: ${errorMessage}`;
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid') && errorMessage.includes('key')) {
        errorMessage = `Invalid API key. Please check your API key from https://supadata.ai. Original error: ${errorMessage}`;
      } else if (errorMessage.includes('rate-limit') || errorMessage.includes('quota')) {
        errorMessage = `Rate limit or quota exceeded. Please check your plan limits or try again later. Original error: ${errorMessage}`;
      }
      
      throw new Error(`Supadata API error: ${errorMessage}`);
    }

    return await response.json() as TranscriptResponse;
  }
}