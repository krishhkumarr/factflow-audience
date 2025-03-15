
import React, { useRef, useEffect } from 'react';
import { useTranscription, FactStatus } from '@/context/TranscriptionContext';
import { CheckCircle, XCircle, HelpCircle, Clock } from 'lucide-react';

const FactChecker: React.FC = () => {
  const { transcriptionHistory } = useTranscription();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [transcriptionHistory]);
  
  const getFactIcon = (status: FactStatus) => {
    switch (status) {
      case 'true':
        return <CheckCircle className="h-5 w-5 text-factTrue flex-shrink-0" />;
      case 'false':
        return <XCircle className="h-5 w-5 text-factFalse flex-shrink-0" />;
      case 'uncertain':
        return <HelpCircle className="h-5 w-5 text-factUnknown flex-shrink-0" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-muted-foreground animate-pulse flex-shrink-0" />;
      default:
        return null;
    }
  };
  
  const getStatusLabel = (status: FactStatus) => {
    switch (status) {
      case 'true':
        return 'Verified';
      case 'false':
        return 'Inaccurate';
      case 'uncertain':
        return 'Unverified';
      case 'checking':
        return 'Checking...';
      default:
        return '';
    }
  };
  
  const getStatusClass = (status: FactStatus) => {
    switch (status) {
      case 'true':
        return 'text-factTrue';
      case 'false':
        return 'text-factFalse';
      case 'uncertain':
        return 'text-factUnknown';
      case 'checking':
        return 'text-muted-foreground';
      default:
        return '';
    }
  };
  
  if (transcriptionHistory.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Speak or type a statement to see its fact check result here
        </p>
      </div>
    );
  }
  
  return (
    <div 
      ref={scrollContainerRef}
      className="glass rounded-xl p-4 overflow-y-auto h-full"
    >
      <h2 className="text-lg font-semibold mb-4">Fact Check Results</h2>
      <div className="space-y-5">
        {transcriptionHistory.map((segment) => (
          <div 
            key={segment.id} 
            className="animate-slide-up border border-border/50 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3 mb-3">
              {getFactIcon(segment.factStatus)}
              <div>
                <p className="font-medium">{segment.text}</p>
                <p className={`text-sm font-medium ${getStatusClass(segment.factStatus)}`}>
                  {getStatusLabel(segment.factStatus)}
                </p>
              </div>
            </div>
            
            {segment.factDetail && segment.factStatus !== 'checking' && (
              <p className="text-sm text-muted-foreground mt-2 pl-8">
                {segment.factDetail}
              </p>
            )}
            
            {segment.additionalInfo && segment.factStatus !== 'checking' && (
              <div className="mt-3 pl-8">
                <p className="text-xs font-medium text-muted-foreground mb-1">Additional Context:</p>
                <p className="text-sm">{segment.additionalInfo}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FactChecker;
