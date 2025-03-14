
import { FactStatus } from '@/context/TranscriptionContext';
import { callOpenAI } from './openaiService';
import { getCachedValue, setCachedValue, hasCache, delay } from './cacheUtils';
import { fallbackFactCheck, fallbackAdditionalInfo, fallbackQuestionGenerator } from './fallbackService';
import { getApiKey, storeApiKey, hasApiKey, clearApiKey } from './apiKeyUtils';

// Re-export the API key management functions
export { storeApiKey, hasApiKey, clearApiKey };

// Check if a statement is factual using OpenAI
export const checkFact = async (text: string): Promise<{ status: FactStatus, detail: string }> => {
  // Check cache first
  const cacheKey = `fact-${text}`;
  if (hasCache(cacheKey)) {
    return getCachedValue(cacheKey);
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
    setCachedValue(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error during fact check:', error);
    // Use fallback on API error
    const result = fallbackFactCheck(text);
    setCachedValue(cacheKey, result);
    return result;
  }
};

// Get additional contextual information about a statement
export const getAdditionalInfo = async (text: string): Promise<string> => {
  // Check cache first
  const cacheKey = `info-${text}`;
  if (hasCache(cacheKey)) {
    return getCachedValue(cacheKey);
  }
  
  try {
    const prompt = `
      Provide one interesting fact or piece of additional context about: "${text}"
      
      Keep your response under 30 words, focus on making it educational and factual.
      Don't start with phrases like "Did you know" or "Interestingly".
      Just provide the information directly.
    `;
    
    const additionalInfo = await callOpenAI(prompt, 100);
    setCachedValue(cacheKey, additionalInfo);
    return additionalInfo;
  } catch (error) {
    console.error('Error getting additional info:', error);
    // Enhanced fallback on error
    const fallbackInfo = fallbackAdditionalInfo(text);
    setCachedValue(cacheKey, fallbackInfo);
    return fallbackInfo;
  }
};

// Generate a question related to the statement
export const generateQuestion = async (text: string): Promise<string | null> => {
  // Only generate questions occasionally to avoid overwhelming the audience
  if (Math.random() > 0.5) {
    return null;
  }
  
  // Check cache first
  const cacheKey = `question-${text}`;
  if (hasCache(cacheKey)) {
    return getCachedValue(cacheKey);
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
    setCachedValue(cacheKey, question);
    return question;
  } catch (error) {
    console.error('Error generating question:', error);
    // Return a generated fallback question instead of null
    const fallbackQuestion = fallbackQuestionGenerator(text);
    setCachedValue(cacheKey, fallbackQuestion);
    return fallbackQuestion;
  }
};
