
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranscription } from '@/context/TranscriptionContext';
import { Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TextInput: React.FC = () => {
  const [text, setText] = useState('');
  const { processTextInput, isRecording, isProcessing } = useTranscription();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter a statement to fact check",
        variant: "destructive",
      });
      return;
    }
    
    processTextInput(text);
    setText('');
    
    toast({
      title: "Processing statement",
      description: "Analyzing your statement...",
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <label htmlFor="fact-check-input" className="text-sm font-medium mb-1">
          Enter a statement to fact check:
        </label>
        <Textarea
          id="fact-check-input"
          placeholder="Type a statement to verify with AI..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[80px]"
          disabled={isRecording || isProcessing}
        />
        <Button 
          type="submit" 
          className="self-end"
          disabled={!text.trim() || isRecording || isProcessing}
        >
          <Send className="mr-2 h-4 w-4" />
          Check Fact
        </Button>
      </form>
    </div>
  );
};

export default TextInput;
