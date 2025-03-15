
import { checkFact, getAdditionalInfo, generateQuestion } from '@/utils/factCheckService';
import { TranscriptionSegment } from './transcription-types';
import { toast } from '@/components/ui/use-toast';

// Process a text segment with AI services
export const processSegmentWithAI = async (
  segment: TranscriptionSegment,
  onResults: (factResult: any, additionalInfo: string, questionResult: string | null) => void
) => {
  try {
    // Process the segment with AI services in parallel
    const [factResult, additionalInfo, questionResult] = await Promise.all([
      checkFact(segment.text),
      getAdditionalInfo(segment.text),
      generateQuestion(segment.text)
    ]);
    
    onResults(factResult, additionalInfo, questionResult);
  } catch (error) {
    console.error('Error processing segment with AI:', error);
    toast({
      title: "Error processing segment",
      description: "Please check your API key and try again",
      variant: "destructive",
    });
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
