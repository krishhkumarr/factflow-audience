
import { getApiKey } from './apiKeyUtils';

// Call OpenAI API with proper error handling
export const callOpenAI = async (prompt: string, maxTokens = 150): Promise<string> => {
  const apiKey = getApiKey();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using gpt-3.5-turbo
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
      console.log('OpenAI API error response:', errorData);
      throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};
