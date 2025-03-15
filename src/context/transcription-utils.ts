
import { checkFact, getAdditionalInfo, generateQuestion, checkStatementFactuality } from '@/utils/factCheckService';
import { TranscriptionSegment } from './transcription-types';
import { toast } from '@/components/ui/use-toast';

// Process a text segment with AI services
export const processSegmentWithAI = async (
  segment: TranscriptionSegment,
  onResults: (factResult: any, additionalInfo: string, questionResult: string | null) => void
) => {
  try {
    console.log('Processing segment:', segment.text);
    
    // Use the direct factuality check function for better error handling
    const result = await checkStatementFactuality(segment.text);
    
    onResults(
      { status: result.status, detail: result.detail }, 
      result.additionalInfo || '', 
      result.question
    );
  } catch (error) {
    console.error('Error processing segment with AI:', error);
    toast({
      title: "Error processing segment",
      description: "Please check your API key and try again",
      variant: "destructive",
    });
    
    // Use fallback processing
    onResults(
      { status: 'uncertain', detail: 'Unable to verify this statement at this time.' },
      'Fact checking service is currently experiencing issues.',
      null
    );
  }
};

// Check if text segment is significant enough to process
export const isSignificantSegment = (text: string): boolean => {
  return text.split(' ').length >= 3;
};

// Format toast notifications
export const showRecordingToast = (isStarting: boolean) => {
  if (isStarting) {
    toast({
      title: "Recording started",
      description: "Speak clearly for best results",
    });
  } else {
    toast({
      title: "Recording stopped",
    });
  }
};

export const showClearAllToast = () => {
  toast({
    title: "All data cleared",
  });
};
