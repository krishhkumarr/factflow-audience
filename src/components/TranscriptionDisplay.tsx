
import React from 'react';
import { useTranscription } from '@/context/TranscriptionContext';

const TranscriptionDisplay: React.FC = () => {
  const { currentTranscription, isRecording } = useTranscription();
  
  if (!isRecording || !currentTranscription) {
    return null;
  }
  
  return (
    <div className="relative w-full max-w-3xl mx-auto mb-6 animate-fade-in">
      <div className="glass rounded-xl p-4 shadow-sm">
        <h2 className="text-xs font-medium text-muted-foreground mb-1">Currently speaking:</h2>
        <p className="text-lg font-medium">{currentTranscription}</p>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
