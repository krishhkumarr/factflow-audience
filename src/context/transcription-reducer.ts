
import { TranscriptionState, TranscriptionSegment, Question } from './transcription-types';

// Action types
export type TranscriptionAction =
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_CURRENT_TRANSCRIPTION'; payload: string }
  | { type: 'SET_PENDING_SEGMENT'; payload: string }
  | { type: 'ADD_TRANSCRIPTION_SEGMENT'; payload: TranscriptionSegment }
  | { type: 'UPDATE_TRANSCRIPTION_SEGMENT'; payload: { id: string; updates: Partial<TranscriptionSegment> } }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'CLEAR_ALL' };

// Initial state
export const initialTranscriptionState: TranscriptionState = {
  isRecording: false,
  isProcessing: false,
  currentTranscription: '',
  transcriptionHistory: [],
  pendingSegment: '',
  questions: [],
  segmentCount: 0,
};

// Reducer function
export const transcriptionReducer = (
  state: TranscriptionState,
  action: TranscriptionAction
): TranscriptionState => {
  switch (action.type) {
    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_CURRENT_TRANSCRIPTION':
      return { ...state, currentTranscription: action.payload };
    case 'SET_PENDING_SEGMENT':
      return { ...state, pendingSegment: action.payload };
    case 'ADD_TRANSCRIPTION_SEGMENT':
      return {
        ...state,
        transcriptionHistory: [...state.transcriptionHistory, action.payload],
        segmentCount: state.segmentCount + 1,
      };
    case 'UPDATE_TRANSCRIPTION_SEGMENT':
      return {
        ...state,
        transcriptionHistory: state.transcriptionHistory.map((segment) =>
          segment.id === action.payload.id
            ? { ...segment, ...action.payload.updates }
            : segment
        ),
      };
    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [...state.questions, action.payload],
      };
    case 'CLEAR_ALL':
      return {
        ...initialTranscriptionState,
      };
    default:
      return state;
  }
};
