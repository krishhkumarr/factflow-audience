
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { startRecognition, stopRecognition } from '@/utils/speechRecognition';
import { TranscriptionContextType, TranscriptionSegment, Question } from './transcription-types';
import { transcriptionReducer, initialTranscriptionState } from './transcription-reducer';
import { processSegmentWithAI, isSignificantSegment, showRecordingToast, showClearAllToast } from './transcription-utils';

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use reducer for state management
  const [state, dispatch] = useReducer(transcriptionReducer, initialTranscriptionState);
  
  // Process new text segment (used for both speech and typed input)
  const processTextSegment = useCallback((newSegment: string) => {
    if (!isSignificantSegment(newSegment)) return;
    
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    const segmentId = `segment-${state.segmentCount}`;
    
    // Add new segment with "checking" status
    const newTranscriptionSegment: TranscriptionSegment = {
      id: segmentId,
      text: newSegment,
      factStatus: 'checking'
    };
    
    dispatch({ type: 'ADD_TRANSCRIPTION_SEGMENT', payload: newTranscriptionSegment });
    
    // Process the segment with AI
    processSegmentWithAI(
      newTranscriptionSegment,
      (factResult, additionalInfo, questionResult) => {
        // Update the segment with AI results
        dispatch({
          type: 'UPDATE_TRANSCRIPTION_SEGMENT',
          payload: {
            id: segmentId,
            updates: {
              factStatus: factResult.status,
              factDetail: factResult.detail,
              additionalInfo
            }
          }
        });
        
        // Add new question if generated
        if (questionResult) {
          dispatch({
            type: 'ADD_QUESTION',
            payload: {
              id: `question-${Date.now()}`,
              text: questionResult,
              timestamp: Date.now()
            }
          });
        }
        
        dispatch({ type: 'SET_PROCESSING', payload: false });
      }
    );
  }, [state.segmentCount]);

  // Handle new transcription text
  const handleTranscription = useCallback((text: string) => {
    dispatch({ type: 'SET_CURRENT_TRANSCRIPTION', payload: text });
    
    // If there's a significant amount of new text, create a new segment
    if (text.length > state.pendingSegment.length + 10) {
      const newSegment = text.substring(state.pendingSegment.length).trim();
      dispatch({ type: 'SET_PENDING_SEGMENT', payload: text });
      
      // Process the new segment
      processTextSegment(newSegment);
    }
  }, [state.pendingSegment, processTextSegment]);

  // Process manually entered text
  const processTextInput = useCallback((text: string) => {
    processTextSegment(text);
  }, [processTextSegment]);

  // Start recording
  const startRecording = useCallback(() => {
    try {
      startRecognition(handleTranscription);
      dispatch({ type: 'SET_RECORDING', payload: true });
      showRecordingToast(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [handleTranscription]);

  // Stop recording
  const stopRecording = useCallback(() => {
    stopRecognition();
    dispatch({ type: 'SET_RECORDING', payload: false });
    dispatch({ type: 'SET_CURRENT_TRANSCRIPTION', payload: '' });
    dispatch({ type: 'SET_PENDING_SEGMENT', payload: '' });
    showRecordingToast(false);
  }, []);

  // Clear all data
  const clearAll = useCallback(() => {
    if (state.isRecording) {
      stopRecognition();
    }
    dispatch({ type: 'CLEAR_ALL' });
    showClearAllToast();
  }, [state.isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (state.isRecording) {
        stopRecognition();
      }
    };
  }, [state.isRecording]);

  const contextValue: TranscriptionContextType = {
    isRecording: state.isRecording,
    isProcessing: state.isProcessing,
    currentTranscription: state.currentTranscription,
    transcriptionHistory: state.transcriptionHistory,
    questions: state.questions,
    startRecording,
    stopRecording,
    processTextInput,
    clearAll,
  };

  return (
    <TranscriptionContext.Provider value={contextValue}>
      {children}
    </TranscriptionContext.Provider>
  );
};

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (context === undefined) {
    throw new Error('useTranscription must be used within a TranscriptionProvider');
  }
  return context;
};

export type { FactStatus } from './transcription-types';
