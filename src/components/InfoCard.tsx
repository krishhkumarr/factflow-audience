
import React from 'react';
import { useTranscription } from '@/context/TranscriptionContext';
import { Card } from '@/components/ui/card';
import { LightbulbIcon } from 'lucide-react';

const InfoCard: React.FC = () => {
  const { transcriptionHistory } = useTranscription();
  
  // Get the most recent additional info
  const latestInfo = transcriptionHistory
    .filter(segment => segment.additionalInfo && segment.factStatus !== 'checking')
    .slice(-1)[0]?.additionalInfo;
  
  if (!latestInfo) {
    return null;
  }
  
  return (
    <Card className="glass-accent rounded-lg p-4 shadow-md animate-slide-right text-foreground">
      <div className="flex items-start gap-3">
        <LightbulbIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium mb-1">Did you know?</h3>
          <p className="text-sm">{latestInfo}</p>
        </div>
      </div>
    </Card>
  );
};

export default InfoCard;
