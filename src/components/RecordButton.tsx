
import React from 'react';
import { useTranscription } from '@/context/TranscriptionContext';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

const RecordButton: React.FC = () => {
  const { isRecording, startRecording, stopRecording } = useTranscription();
  
  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      size="lg"
      className={`rounded-full h-16 w-16 shadow-lg transition-all duration-300 ${
        isRecording 
          ? 'bg-destructive hover:bg-destructive/90' 
          : 'bg-primary hover:bg-primary/90'
      }`}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <MicOff className="h-6 w-6" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </Button>
  );
};

export default RecordButton;
