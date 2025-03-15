
import React, { useRef, useEffect, useState } from 'react';
import { useTranscription } from '@/context/TranscriptionContext';
import { Card } from '@/components/ui/card';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AudienceQuestions: React.FC = () => {
  const { questions, isProcessing } = useTranscription();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  
  useEffect(() => {
    // Check the console for errors
    const checkForErrors = () => {
      try {
        // Look for OpenAI API errors in recent console output
        const recentErrors = (window as any).console.error.calls || [];
        const apiErrorPresent = recentErrors.some((call: any) => 
          typeof call[0] === 'string' && 
          (call[0].includes('OpenAI API error') || 
           call[0].includes('Error during fact check') ||
           call[0].includes('Error getting additional info'))
        );
        
        setHasError(apiErrorPresent);
      } catch (e) {
        // Unable to check errors, don't show error message
      }
    };
    
    // Check for errors when processing state changes
    if (!isProcessing) {
      checkForErrors();
    }
  }, [isProcessing]);
  
  useEffect(() => {
    if (scrollContainerRef.current && questions.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [questions]);
  
  if (hasError) {
    return (
      <div className="glass rounded-xl p-6 h-full flex flex-col items-center justify-center">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            API quota exceeded. Questions cannot be generated at this time.
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Try again later or use a different API key in settings.
        </p>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          AI-generated questions will appear here
        </p>
      </div>
    );
  }
  
  return (
    <div 
      ref={scrollContainerRef}
      className="glass rounded-xl p-4 overflow-y-auto h-full"
    >
      <h2 className="text-lg font-semibold mb-4">Questions to Consider</h2>
      <div className="space-y-3">
        {questions.map((question) => (
          <Card 
            key={question.id} 
            className="p-3 animate-slide-up transition-all duration-300 hover:shadow-md border-border/50"
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">{question.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AudienceQuestions;
