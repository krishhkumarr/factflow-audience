
// Define shared types for the transcription context

export type FactStatus = 'true' | 'false' | 'uncertain' | 'checking' | null;

export interface TranscriptionSegment {
  id: string;
  text: string;
  factStatus: FactStatus;
  factDetail?: string;
  additionalInfo?: string;
}

export interface Question {
  id: string;
  text: string;
  timestamp: number;
}

export interface TranscriptionState {
  isRecording: boolean;
  isProcessing: boolean;
  currentTranscription: string;
  transcriptionHistory: TranscriptionSegment[];
  pendingSegment: string;
  questions: Question[];
  segmentCount: number;
}

export interface TranscriptionContextType {
  isRecording: boolean;
  isProcessing: boolean;
  currentTranscription: string;
  transcriptionHistory: TranscriptionSegment[];
  questions: Question[];
  startRecording: () => void;
  stopRecording: () => void;
  processTextInput: (text: string) => void;
  clearAll: () => void;
}
