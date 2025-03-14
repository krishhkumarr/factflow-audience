
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { startRecognition, stopRecognition } from '@/utils/speechRecognition';
import { checkFact, getAdditionalInfo, generateQuestion } from '@/utils/factCheckService';
import { toast } from '@/components/ui/use-toast';

export type FactStatus = 'true' | 'false' | 'uncertain' | 'checking' | null;

interface TranscriptionSegment {
  id: string;
  text: string;
  factStatus: FactStatus;
  factDetail?: string;
  additionalInfo?: string;
}

interface Question {
  id: string;
  text: string;
  timestamp: number;
}

interface TranscriptionContextType {
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

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionSegment[]>([]);
  const [pendingSegment, setPendingSegment] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [segmentCount, setSegmentCount] = useState(0);

  // Process new text segment (used for both speech and typed input)
  const processTextSegment = useCallback((newSegment: string) => {
    if (newSegment.split(' ').length < 3) return;
    
    setIsProcessing(true);
    const segmentId = `segment-${segmentCount}`;
    setSegmentCount(prev => prev + 1);
    
    // Add new segment with "checking" status
    const newTranscriptionSegment: TranscriptionSegment = {
      id: segmentId,
      text: newSegment,
      factStatus: 'checking'
    };
    
    setTranscriptionHistory(prev => [...prev, newTranscriptionSegment]);
    
    // Process the segment with AI
    Promise.all([
      checkFact(newSegment),
      getAdditionalInfo(newSegment),
      generateQuestion(newSegment)
    ]).then(([factResult, additionalInfo, questionResult]) => {
      // Update the segment with AI results
      setTranscriptionHistory(prev => 
        prev.map(segment => 
          segment.id === segmentId 
            ? { 
                ...segment, 
                factStatus: factResult.status, 
                factDetail: factResult.detail,
                additionalInfo 
              } 
            : segment
        )
      );
      
      // Add new question if generated
      if (questionResult) {
        setQuestions(prev => [
          ...prev, 
          { id: `question-${Date.now()}`, text: questionResult, timestamp: Date.now() }
        ]);
      }
      
      setIsProcessing(false);
    });
  }, [segmentCount]);

  // Handle new transcription text
  const handleTranscription = useCallback((text: string) => {
    setCurrentTranscription(text);
    
    // If there's a significant amount of new text, create a new segment
    if (text.length > pendingSegment.length + 10) {
      const newSegment = text.substring(pendingSegment.length).trim();
      setPendingSegment(text);
      
      // Process the new segment
      processTextSegment(newSegment);
    }
  }, [pendingSegment, processTextSegment]);

  // Process manually entered text
  const processTextInput = useCallback((text: string) => {
    processTextSegment(text);
  }, [processTextSegment]);

  // Start recording
  const startRecording = useCallback(() => {
    try {
      startRecognition(handleTranscription);
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly for best results",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Failed to start recording",
        description: "Please check microphone permissions",
        variant: "destructive",
      });
    }
  }, [handleTranscription]);

  // Stop recording
  const stopRecording = useCallback(() => {
    stopRecognition();
    setIsRecording(false);
    setCurrentTranscription('');
    setPendingSegment('');
    toast({
      title: "Recording stopped",
    });
  }, []);

  // Clear all data
  const clearAll = useCallback(() => {
    if (isRecording) {
      stopRecognition();
      setIsRecording(false);
    }
    setCurrentTranscription('');
    setPendingSegment('');
    setTranscriptionHistory([]);
    setQuestions([]);
    setSegmentCount(0);
    toast({
      title: "All data cleared",
    });
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecognition();
      }
    };
  }, [isRecording]);

  const value = {
    isRecording,
    isProcessing,
    currentTranscription,
    transcriptionHistory,
    questions,
    startRecording,
    stopRecording,
    processTextInput,
    clearAll,
  };

  return (
    <TranscriptionContext.Provider value={value}>
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
