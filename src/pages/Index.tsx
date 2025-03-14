
import React from 'react';
import { TranscriptionProvider } from '@/context/TranscriptionContext';
import Header from '@/components/Header';
import RecordButton from '@/components/RecordButton';
import TranscriptionDisplay from '@/components/TranscriptionDisplay';
import FactChecker from '@/components/FactChecker';
import InfoCard from '@/components/InfoCard';
import AudienceQuestions from '@/components/AudienceQuestions';

const Index: React.FC = () => {
  return (
    <TranscriptionProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto mt-20 mb-24 px-4">
          <div className="flex flex-col items-center justify-center pt-8 pb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">
              Real-time Fact Checking
            </h1>
            <p className="text-center text-muted-foreground max-w-xl mb-8">
              Listen to a presentation while AI provides fact checks, additional context,
              and thought-provoking questions in real-time.
            </p>
            
            <TranscriptionDisplay />
            
            <div className="w-full my-4">
              <InfoCard />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              <div className="h-[500px]">
                <FactChecker />
              </div>
              <div className="h-[500px]">
                <AudienceQuestions />
              </div>
            </div>
          </div>
        </main>
        
        <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50">
          <RecordButton />
        </footer>
      </div>
    </TranscriptionProvider>
  );
};

export default Index;
