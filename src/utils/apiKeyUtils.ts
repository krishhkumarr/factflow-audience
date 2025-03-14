
// Function to get API key from localStorage or use provided one
export const getApiKey = (): string => {
  return localStorage.getItem('openai_api_key') || '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';
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
