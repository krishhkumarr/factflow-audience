
import React from 'react';
import { useTranscription } from '@/context/TranscriptionContext';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const Header: React.FC = () => {
  const { isRecording, isProcessing, clearAll } = useTranscription();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40">
      <div className="container mx-auto py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <h1 className="text-xl font-semibold tracking-tight">FactFlow</h1>
            <span className="text-xs tracking-wide text-muted-foreground">Audience</span>
          </div>
          
          {isRecording && (
            <div className="flex items-center ml-4">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping-slow"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <span className="ml-2 text-sm font-medium text-muted-foreground animate-pulse-recording">
                {isProcessing ? 'Processing...' : 'Recording'}
              </span>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Clear all data"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
