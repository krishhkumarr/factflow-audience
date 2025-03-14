
import { FactStatus } from '@/context/TranscriptionContext';

// Simulated AI fact checking service
// In a real app, this would connect to an actual AI service

// Helper to introduce artificial delay (simulates API call)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple cache to avoid reprocessing the same text
const cache = new Map<string, any>();

// Check if a statement is factual
export const checkFact = async (text: string): Promise<{ status: FactStatus, detail: string }> => {
  // Check cache first
  const cacheKey = `fact-${text}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Simulate API latency
  await delay(Math.random() * 1000 + 500);
  
  // Simple keyword-based simulation
  const lowerText = text.toLowerCase();
  
  let result: { status: FactStatus, detail: string };
  
  if (lowerText.includes('earth is flat') || 
      lowerText.includes('moon landing fake') || 
      lowerText.includes('vaccines cause autism')) {
    result = { 
      status: 'false', 
      detail: 'This statement contradicts established scientific consensus.' 
    };
  } 
  else if (lowerText.includes('water') && lowerText.includes('boil') ||
           lowerText.includes('earth') && lowerText.includes('round') ||
           lowerText.includes('gravity')) {
    result = { 
      status: 'true', 
      detail: 'This statement aligns with established scientific facts.' 
    };
  }
  else if (lowerText.includes('will') || 
           lowerText.includes('future') || 
           lowerText.includes('might') || 
           lowerText.includes('could')) {
    result = { 
      status: 'uncertain', 
      detail: 'This statement relates to future events or possibilities that cannot be verified.' 
    };
  }
  else {
    // Randomly assign fact status for demonstration purposes
    // In a real app, this would be a proper AI analysis
    const random = Math.random();
    if (random < 0.6) {
      result = { 
        status: 'true', 
        detail: 'Based on available information, this appears to be accurate.' 
      };
    } else if (random < 0.8) {
      result = { 
        status: 'false', 
        detail: 'This statement contains inaccuracies or misrepresentations.' 
      };
    } else {
      result = { 
        status: 'uncertain', 
        detail: 'There isn\'t enough context or information to verify this statement.' 
      };
    }
  }
  
  // Cache the result
  cache.set(cacheKey, result);
  return result;
};

// Get additional contextual information about a statement
export const getAdditionalInfo = async (text: string): Promise<string> => {
  // Check cache first
  const cacheKey = `info-${text}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Simulate API latency
  await delay(Math.random() * 1500 + 500);
  
  // Simple keyword-based simulation
  const lowerText = text.toLowerCase();
  
  let additionalInfo = '';
  
  if (lowerText.includes('water') && lowerText.includes('boil')) {
    additionalInfo = 'Water boils at 100°C (212°F) at sea level, but the boiling point decreases with altitude due to lower atmospheric pressure.';
  }
  else if (lowerText.includes('earth') && lowerText.includes('round')) {
    additionalInfo = 'The Earth is an oblate spheroid, slightly flattened at the poles and bulging at the equator, with a circumference of approximately 40,075 km (24,901 mi).';
  }
  else if (lowerText.includes('gravity')) {
    additionalInfo = 'Gravity is one of the four fundamental forces and is described by Einstein\'s theory of General Relativity as the curvature of spacetime caused by mass and energy.';
  }
  else if (lowerText.includes('brain') || lowerText.includes('neuron')) {
    additionalInfo = 'The human brain contains approximately 86 billion neurons, connected by trillions of synapses. It consumes about 20% of the body\'s energy despite being only 2% of its weight.';
  }
  else if (lowerText.includes('climate') || lowerText.includes('warming')) {
    additionalInfo = 'Global climate data shows that the Earth's average temperature has increased by about 1.1°C since the pre-industrial era, primarily due to human activities.';
  }
  else if (lowerText.includes('quantum') || lowerText.includes('physics')) {
    additionalInfo = 'Quantum mechanics describes nature at the smallest scales of energy levels of atoms and subatomic particles, introducing concepts like wave-particle duality and quantum entanglement.';
  }
  else {
    // Generate generic additional information
    const topics = [
      'This topic relates to ongoing research in multiple scientific disciplines.',
      'Historical context is important when considering this statement.',
      'There are multiple perspectives on this topic among experts in the field.',
      'Recent studies have provided new insights into this area.',
      'This concept has evolved significantly over the past decades.',
      'Understanding this topic requires consideration of multiple factors.',
      'This relates to fundamental principles across several domains of knowledge.'
    ];
    additionalInfo = topics[Math.floor(Math.random() * topics.length)];
  }
  
  // Cache the result
  cache.set(cacheKey, additionalInfo);
  return additionalInfo;
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
  
  // Simulate API latency
  await delay(Math.random() * 2000 + 1000);
  
  // Simple keyword-based simulation
  const lowerText = text.toLowerCase();
  
  let question = '';
  
  if (lowerText.includes('water') || lowerText.includes('ocean')) {
    question = 'How does water scarcity affect global food security?';
  }
  else if (lowerText.includes('earth') || lowerText.includes('planet')) {
    question = 'How has our understanding of Earth's place in the universe evolved over time?';
  }
  else if (lowerText.includes('gravity') || lowerText.includes('physics')) {
    question = 'How do gravitational waves help us understand the universe?';
  }
  else if (lowerText.includes('brain') || lowerText.includes('think')) {
    question = 'How does neuroplasticity affect our ability to learn new skills?';
  }
  else if (lowerText.includes('climate') || lowerText.includes('environment')) {
    question = 'What innovations show the most promise for addressing climate change?';
  }
  else if (lowerText.includes('technology') || lowerText.includes('digital')) {
    question = 'How might advances in AI reshape human creativity and work?';
  }
  else {
    // Generate a generic question
    const questions = [
      'How might this information affect our understanding of related topics?',
      'What are the ethical implications of this concept?',
      'How has this idea evolved throughout history?',
      'What counterarguments exist to this perspective?',
      'How does this relate to everyday experiences?',
      'What future developments might we expect in this area?',
      'How does this concept connect to other disciplines?'
    ];
    question = questions[Math.floor(Math.random() * questions.length)];
  }
  
  // Cache the result
  cache.set(cacheKey, question);
  return question;
};
