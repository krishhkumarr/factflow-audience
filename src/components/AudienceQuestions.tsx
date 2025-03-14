
import React, { useRef, useEffect } from 'react';
import { useTranscription } from '@/context/TranscriptionContext';
import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const AudienceQuestions: React.FC = () => {
  const { questions } = useTranscription();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollContainerRef.current && questions.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [questions]);
  
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
