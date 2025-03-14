
import { FactStatus } from '@/context/TranscriptionContext';

// Enhanced fallback method for when API is unavailable
export const fallbackFactCheck = (text: string): { status: FactStatus; detail: string } => {
  const lowerText = text.toLowerCase();
  
  // Common knowledge fact checks
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
  // Sports-related checks
  else if ((lowerText.includes('lebron') || lowerText.includes('lebron james')) && 
           (lowerText.includes('baseball') || lowerText.includes('football'))) {
    return { 
      status: 'false', 
      detail: 'LeBron James is a basketball player, not a baseball or football player.' 
    };
  }
  else if ((lowerText.includes('lebron') || lowerText.includes('lebron james')) && 
           lowerText.includes('basketball')) {
    return { 
      status: 'true', 
      detail: 'LeBron James is a professional basketball player in the NBA.' 
    };
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
  else {
    // Default to uncertain when we can't determine
    return { 
      status: 'uncertain', 
      detail: 'Without access to the AI service, we can\'t verify this statement.' 
    };
  }
};

// Fallback for additional info
export const fallbackAdditionalInfo = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('lebron') || lowerText.includes('lebron james')) {
    return 'LeBron James is widely considered one of the greatest basketball players of all time and has won multiple NBA championships.';
  }
  else if (lowerText.includes('earth') && (lowerText.includes('flat') || lowerText.includes('round'))) {
    return 'The Earth is an oblate spheroid, slightly flattened at the poles due to its rotation.';
  }
  else if (lowerText.includes('moon landing')) {
    return 'NASA's Apollo 11 mission successfully landed humans on the Moon on July 20, 1969.';
  }
  else if (lowerText.includes('vaccine') || lowerText.includes('vaccination')) {
    return 'Vaccines have been scientifically proven to prevent millions of illnesses and deaths around the world.';
  }
  
  // Generic fallbacks for when we don't have a specific match
  const genericFallbacks = [
    'This topic connects to various fields of knowledge and ongoing research.',
    'Understanding this concept requires examining multiple scientific perspectives.',
    'Historical context is important when evaluating statements like this.',
    'Critical thinking involves questioning assumptions and examining evidence.',
    'Scientific consensus on this topic has evolved over the decades.'
  ];
  
  return genericFallbacks[Math.floor(Math.random() * genericFallbacks.length)];
};

// Fallback question generator
export const fallbackQuestionGenerator = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('lebron') || lowerText.includes('lebron james')) {
    const questions = [
      'How has LeBron James influenced basketball beyond his athletic performance?',
      'What factors contribute to the debate about the greatest basketball player of all time?',
      'How do cultural and social contexts shape our perception of sports figures?'
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }
  else if (lowerText.includes('earth') || lowerText.includes('planet')) {
    const questions = [
      'How does our understanding of Earth's systems impact environmental policy?',
      'What can Earth's history teach us about future climate patterns?',
      'How has our conception of Earth changed throughout human history?'
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  // Generic thought-provoking questions
  const genericQuestions = [
    'How might this information influence our understanding of related topics?',
    'What ethical considerations arise from this concept?',
    'How has this idea evolved throughout different historical periods?',
    'What counterarguments exist to this perspective?',
    'How does this relate to everyday experiences and decision-making?'
  ];
  
  return genericQuestions[Math.floor(Math.random() * genericQuestions.length)];
};
