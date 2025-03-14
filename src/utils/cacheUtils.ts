
// Cache to avoid reprocessing the same text
const cache = new Map<string, any>();

// Helper to introduce artificial delay (for when using cache)
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get cached value
export const getCachedValue = <T>(key: string): T | undefined => {
  return cache.get(key);
};

// Store value in cache
export const setCachedValue = <T>(key: string, value: T): void => {
  cache.set(key, value);
};

// Check if value exists in cache
export const hasCache = (key: string): boolean => {
  return cache.has(key);
};
