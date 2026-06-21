export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface SpeechRecognitionEvent {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  alternatives: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface SpeechError {
  error: string;
  message: string;
}
