
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { hasApiKey, storeApiKey, clearApiKey } from '@/utils/apiKeyUtils';
import { toast } from '@/components/ui/use-toast';
import { KeyRound, AlertCircle } from 'lucide-react';

const ApiKeyForm: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  
  useEffect(() => {
    // Check if key exists on component mount
    setHasKey(hasApiKey());
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation - OpenAI keys typically start with "sk-"
    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Warning",
        description: "This doesn't look like a valid OpenAI API key. It should start with 'sk-'",
        variant: "destructive",
      });
      return;
    }
    
    // Store the API key
    storeApiKey(apiKey);
    setHasKey(true);
    setApiKey('');
    
    toast({
      title: "Success",
      description: "API key saved. It will only be stored in your browser's local storage.",
    });
  };
  
  const handleClear = () => {
    clearApiKey();
    setHasKey(false);
    
    toast({
      title: "API key removed",
      description: "The API key has been removed from your browser's storage.",
    });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          {hasKey ? "OpenAI API Key Configured" : "Enter OpenAI API Key"}
        </CardTitle>
        <CardDescription>
          {hasKey 
            ? "Your API key is securely stored in your browser's local storage."
            : "Your key is stored only in your browser and never sent to our servers."}
        </CardDescription>
      </CardHeader>
      
      {!hasKey ? (
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="font-mono"
              />
              <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>Using API keys in client-side code is not secure for production applications.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Save API Key</Button>
          </CardFooter>
        </form>
      ) : (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="w-full"
          >
            Remove API Key
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ApiKeyForm;
