import { FactStatus } from '@/context/TranscriptionContext';

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
};

// Check if API key exists
export const hasApiKey = (): boolean => {
  return true; // Always return true since we have a default key
};

// Clear API key from localStorage
export const clearApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

// Call OpenAI API with proper error handling
const callOpenAI = async (prompt: string, maxTokens = 150): Promise<string> => {
  const apiKey = getApiKey();
  
  try {
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
      throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

// Fallback method for when API is unavailable
const fallbackFactCheck = (text: string): { status: FactStatus, detail: string } => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('earth is flat') || 
      lowerText.includes('moon landing fake') || 
      lowerText.includes('vaccines cause autism')) {
    return { 
      status: 'false', 
      detail: 'This statement contradicts established scientific consensus.' 
    };
  } 
  else if (lowerText.includes('water') && lowerText.includes('boil') ||
           lowerText.includes('earth') && lowerText.includes('round') ||
           lowerText.includes('gravity')) {
    return { 
      status: 'true', 
      detail: 'This statement aligns with established scientific facts.' 
    };
  }
  else if (lowerText.includes('will') || 
           lowerText.includes('future') || 
           lowerText.includes('might') || 
           lowerText.includes('could')) {
    return { 
      status: 'uncertain', 
      detail: 'This statement relates to future events or possibilities that cannot be verified.' 
    };
  }
  else {
    // Default to uncertain when we can't determine
    return { 
      status: 'uncertain', 
      detail: 'There isn\'t enough context or information to verify this statement.' 
    };
  }
};

// Check if a statement is factual using OpenAI
export const checkFact = async (text: string): Promise<{ status: FactStatus, detail: string }> => {
  // Check cache first
  const cacheKey = `fact-${text}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  if (!hasApiKey()) {
    // Use fallback method if no API key
    const result = fallbackFactCheck(text);
    cache.set(cacheKey, result);
    return result;
  }
  
  try {
    const prompt = `
      Analyze this statement for factual accuracy: "${text}"
      
      First, categorize it as one of: TRUE (verified fact), FALSE (contains misinformation), or UNCERTAIN (cannot be definitively verified).
      
      Then provide a brief explanation (max 20 words) justifying your categorization.
      
      Format your response exactly like this example:
      CATEGORY: TRUE
      EXPLANATION: This is verified by extensive scientific research.
    `;
    
    const response = await callOpenAI(prompt, 150);
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
  
  if (!hasApiKey()) {
    // Simulate API latency
    await delay(Math.random() * 1500 + 500);
    
    // Use simplified fallback
    const fallbackInfos = [
      'This topic relates to ongoing research in multiple scientific disciplines.',
      'Historical context is important when considering this statement.',
      'There are multiple perspectives on this topic among experts in the field.',
      'Recent studies have provided new insights into this area.',
      'This concept has evolved significantly over the past decades.',
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
  
  if (!hasApiKey()) {
    // Simulate API latency
    await delay(Math.random() * 2000 + 1000);
    
    // Use simplified fallback
    const fallbackQuestions = [
      'How might this information affect our understanding of related topics?',
      'What are the ethical implications of this concept?',
      'How has this idea evolved throughout history?',
      'What counterarguments exist to this perspective?',
      'How does this relate to everyday experiences?',
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
