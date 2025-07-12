export interface SupadataConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TranscriptRequest {
  url: string;
  lang?: string;
  text?: boolean;
  mode?: 'native' | 'generate' | 'auto';
}

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
  lang: string;
}

export interface TranscriptResponseText {
  content: string;
  lang: string;
  availableLangs: string[];
}

export interface TranscriptResponseDetailed {
  content: TranscriptSegment[];
  lang: string;
  availableLangs: string[];
}

export type TranscriptResponse = TranscriptResponseText | TranscriptResponseDetailed;

export interface SupadataError {
  error: string;
  message?: string;
  code?: string;
}