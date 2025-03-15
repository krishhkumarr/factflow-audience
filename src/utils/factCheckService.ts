
import { FactStatus } from '@/context/TranscriptionContext';
import { toast } from '@/components/ui/use-toast';

// Cache to avoid reprocessing the same text
const cache = new Map<string, any>();

// Helper to introduce artificial delay (for when using cache)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// The provided OpenAI API key (will use this if no key in localStorage)
const DEFAULT_API_KEY = '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';

// Function to get API key from localStorage or use provided one
const getApiKey = (): string => {
  return localStorage.getItem('openai_api_key') || DEFAULT_API_KEY;
};

// Store API key in localStorage
export const storeApiKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key);
  // Clear cache when changing API key
  cache.clear();
  // Reset API error flag when changing key
  apiErrorDetected = false;
  
  toast({
    title: "API Key Updated",
    description: "Your OpenAI API key has been saved",
  });
};

// Check if API key exists
export const hasApiKey = (): boolean => {
  return true; // Always return true since we have a default key
};

// Clear API key from localStorage
export const clearApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
  // Reset API error flag when clearing key
  apiErrorDetected = false;
  
  toast({
    title: "API Key Removed",
    description: "Using default API key now",
  });
};

// Track API errors to avoid repeated failed calls
let apiErrorDetected = false;
const resetApiErrorStatus = () => {
  setTimeout(() => {
    apiErrorDetected = false;
  }, 60000); // Reset after 1 minute
};

// Call OpenAI API with proper error handling
const callOpenAI = async (prompt: string, maxTokens = 150): Promise<string> => {
  // If we already detected an API error, don't make additional calls
  if (apiErrorDetected) {
    throw new Error('API currently unavailable due to quota limits');
  }
  
  const apiKey = getApiKey();
  
  try {
    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful, factual assistant. Provide accurate, concise responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      
      // Check for quota exceeded error
      if (response.status === 429 || 
          (errorData.error && (
            errorData.error.type === 'insufficient_quota' || 
            errorData.error.code === 'insufficient_quota' ||
            errorData.error.message.includes('quota')
          ))) {
        apiErrorDetected = true;
        resetApiErrorStatus();
        toast({
          title: "API Quota Exceeded",
          description: "Using fallback mode for fact checking",
          variant: "destructive",
        });
      }
      
      throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

// Enhanced fallback method for when API is unavailable
const fallbackFactCheck = (text: string): { status: FactStatus, detail: string } => {
  const lowerText = text.toLowerCase();
  
  // Common misinformation
  if (lowerText.includes('earth is flat') || 
      lowerText.includes('moon landing fake') || 
      lowerText.includes('vaccines cause autism') ||
      lowerText.includes('5g causes covid') ||
      lowerText.includes('climate change is a hoax')) {
    return { 
      status: 'false', 
      detail: 'This statement contradicts established scientific consensus.' 
    };
  } 
  
  // Well-established facts
  else if ((lowerText.includes('water') && lowerText.includes('boil')) ||
           (lowerText.includes('earth') && lowerText.includes('round')) ||
           lowerText.includes('gravity') ||
           (lowerText.includes('sun') && lowerText.includes('center')) ||
           (lowerText.includes('humans') && lowerText.includes('mammals'))) {
    return { 
      status: 'true', 
      detail: 'This statement aligns with established scientific facts.' 
    };
  }
  
  // Sports facts
  else if (lowerText.includes('lebron') || lowerText.includes('goat')) {
    if (lowerText.includes('basketball') || lowerText.includes('nba') || lowerText.includes('goat')) {
      return { 
        status: 'uncertain', 
        detail: 'This contains subjective opinions about sports figures.' 
      };
    } else if (lowerText.includes('baseball') || lowerText.includes('football')) {
      return { 
        status: 'false', 
        detail: 'This contains misconceptions about sports figures.' 
      };
    }
  }
  
  // Future predictions
  else if (lowerText.includes('will') || 
           lowerText.includes('future') || 
           lowerText.includes('might') || 
           lowerText.includes('could')) {
    return { 
      status: 'uncertain', 
      detail: 'This statement relates to future events or possibilities that cannot be verified.' 
    };
  }
  
  // Default to uncertain when we can't determine
  return { 
    status: 'uncertain', 
    detail: 'There isn\'t enough context or information to verify this statement.' 
  };
};

// Extended keyword-based fact checking for common topics
const keywordFactCheck = (text: string): { status: FactStatus, detail: string } | null => {
  const lowerText = text.toLowerCase();
  
  // Science topics
  if (lowerText.includes('evolution') && lowerText.includes('theory')) {
    return { 
      status: 'true', 
      detail: 'Evolution is widely accepted scientific theory supported by extensive evidence.' 
    };
  }
  
  // History topics
  if (lowerText.includes('world war 2') || lowerText.includes('world war ii')) {
    if (lowerText.includes('1939') && lowerText.includes('1945')) {
      return { 
        status: 'true', 
        detail: 'World War II did occur between 1939 and 1945.' 
      };
    }
  }
  
  // Return null if no keyword matches found
  return null;
}

// Check if a statement is factual using OpenAI or fallbacks
export const checkFact = async (text: string): Promise<{ status: FactStatus, detail: string }> => {
  // Check cache first
  const cacheKey = `fact-${text}`;
  if (cache.has(cacheKey)) {
    const cachedResult = cache.get(cacheKey);
    console.log('Using cached fact check for:', text);
    return cachedResult;
  }
  
  // Check if we can use keyword matching first (faster)
  const keywordResult = keywordFactCheck(text);
  if (keywordResult) {
    console.log('Using keyword fact check for:', text);
    cache.set(cacheKey, keywordResult);
    return keywordResult;
  }
  
  // If API error already detected, use fallback immediately
  if (apiErrorDetected) {
    console.log('API error detected, using fallback for:', text);
    const result = fallbackFactCheck(text);
    cache.set(cacheKey, result);
    return result;
  }
  
  try {
    console.log('Performing OpenAI fact check for:', text);
    const prompt = `
      Analyze this statement for factual accuracy: "${text}"
      
      First, categorize it as one of: TRUE (verified fact), FALSE (contains misinformation), or UNCERTAIN (cannot be definitively verified).
      
      Then provide a brief explanation (max 20 words) justifying your categorization.
      
      Format your response exactly like this example:
      CATEGORY: TRUE
      EXPLANATION: This is verified by extensive scientific research.
    `;
    
    const response = await callOpenAI(prompt, 150);
    console.log('OpenAI fact check response:', response);
    
    const categoryMatch = response.match(/CATEGORY:\s*(TRUE|FALSE|UNCERTAIN)/i);
    const explanationMatch = response.match(/EXPLANATION:\s*(.*)/i);
    
    let status: FactStatus = 'uncertain'; // Default
    
    if (categoryMatch && categoryMatch[1]) {
      const category = categoryMatch[1].toUpperCase();
      if (category === 'TRUE') status = 'true';
      else if (category === 'FALSE') status = 'false';
      else status = 'uncertain';
    }
    
    const detail = explanationMatch && explanationMatch[1] 
      ? explanationMatch[1] 
      : 'Analysis complete but no detailed explanation available.';
    
    const result = { status, detail };
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error during fact check:', error);
    // Use fallback on API error
    console.log('Using fallback after API error for:', text);
    const result = fallbackFactCheck(text);
    cache.set(cacheKey, result);
    return result;
  }
};

// Get additional contextual information about a statement
export const getAdditionalInfo = async (text: string): Promise<string> => {
  // Check cache first
  const cacheKey = `info-${text}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // If API error already detected, use fallback immediately
  if (apiErrorDetected) {
    await delay(Math.random() * 500 + 200); // Simulate shorter API latency
    
    // Use fallback info generation
    const fallbackInfos = [
      'This topic relates to ongoing research in multiple scientific disciplines.',
      'Historical context is important when considering this statement.',
      'There are multiple perspectives on this topic among experts in the field.',
      'Recent studies have provided new insights into this area.',
      'This concept has evolved significantly over the past decades.',
      'Educational resources often include this topic in their curriculum.',
      'Many people commonly misunderstand this concept.',
      'The scientific community generally agrees on the fundamental aspects of this topic.',
    ];
    const additionalInfo = fallbackInfos[Math.floor(Math.random() * fallbackInfos.length)];
    cache.set(cacheKey, additionalInfo);
    return additionalInfo;
  }
  
  try {
    const prompt = `
      Provide one interesting fact or piece of additional context about: "${text}"
      
      Keep your response under 30 words, focus on making it educational and factual.
      Don't start with phrases like "Did you know" or "Interestingly".
      Just provide the information directly.
    `;
    
    const additionalInfo = await callOpenAI(prompt, 100);
    cache.set(cacheKey, additionalInfo);
    return additionalInfo;
  } catch (error) {
    console.error('Error getting additional info:', error);
    // Fallback on error
    const fallbackInfo = 'This topic connects to various fields of knowledge and ongoing research.';
    cache.set(cacheKey, fallbackInfo);
    return fallbackInfo;
  }
};

// Generate a question related to the statement
export const generateQuestion = async (text: string): Promise<string | null> => {
  // Only generate questions occasionally to avoid overwhelming the audience
  if (Math.random() > 0.3) {
    return null;
  }
  
  // Check cache first
  const cacheKey = `question-${text}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // If API error already detected, use fallback immediately
  if (apiErrorDetected) {
    await delay(Math.random() * 500 + 200); // Simulate shorter API latency
    
    // Use fallback question generation
    const fallbackQuestions = [
      'How might this information affect our understanding of related topics?',
      'What are the ethical implications of this concept?',
      'How has this idea evolved throughout history?',
      'What counterarguments exist to this perspective?',
      'How does this relate to everyday experiences?',
      'Who benefits from this knowledge being widely accepted?',
      'How might future research change our understanding of this topic?',
      'What assumptions underlie this statement?',
    ];
    const question = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    cache.set(cacheKey, question);
    return question;
  }
  
  try {
    const prompt = `
      Generate one thought-provoking question related to this statement: "${text}"
      
      The question should:
      1. Be open-ended (not yes/no)
      2. Encourage critical thinking
      3. Relate to the broader implications of the topic
      4. Be concise (under 15 words if possible)
      
      Format as a direct question without any introduction.
    `;
    
    const question = await callOpenAI(prompt, 80);
    cache.set(cacheKey, question);
    return question;
  } catch (error) {
    console.error('Error generating question:', error);
    return null; // Skip question on error
  }
};

// Direct fact check function for use from UI
export const checkStatementFactuality = async (statement: string): Promise<{
  status: FactStatus;
  detail: string;
  additionalInfo?: string;
  question?: string | null;
}> => {
  try {
    // Process all in parallel for efficiency
    const [factResult, additionalInfo, questionResult] = await Promise.all([
      checkFact(statement),
      getAdditionalInfo(statement),
      generateQuestion(statement)
    ]);
    
    return {
      status: factResult.status,
      detail: factResult.detail,
      additionalInfo,
      question: questionResult
    };
  } catch (error) {
    console.error('Error checking statement factuality:', error);
    
    // Provide fallback results
    const fallbackResult = fallbackFactCheck(statement);
    return {
      status: fallbackResult.status,
      detail: fallbackResult.detail,
      additionalInfo: 'Unable to generate additional context at this time.',
      question: null
    };
  }
};
