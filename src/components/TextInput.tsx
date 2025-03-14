
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranscription } from '@/context/TranscriptionContext';
import { Send } from 'lucide-react';

const TextInput: React.FC = () => {
  const [text, setText] = useState('');
  const { processTextInput, isRecording } = useTranscription();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    processTextInput(text);
    setText('');
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <Textarea
          placeholder="Type text to test AI responses..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[80px]"
          disabled={isRecording}
        />
        <Button 
          type="submit" 
          className="self-end"
          disabled={!text.trim() || isRecording}
        >
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </form>
    </div>
  );
};

export default TextInput;
