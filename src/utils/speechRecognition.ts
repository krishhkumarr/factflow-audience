// Speech recognition implementation
let recognition: SpeechRecognition | null = null;

// Check if the browser supports speech recognition
const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Initialize speech recognition
const initRecognition = (): SpeechRecognition => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    throw new Error('Speech recognition is not supported in this browser');
  }
  
  const recognitionInstance = new SpeechRecognition();
  recognitionInstance.continuous = true;
  recognitionInstance.interimResults = true;
  recognitionInstance.lang = 'en-US';
  
  return recognitionInstance;
};

// Start speech recognition
export const startRecognition = (onTranscriptionUpdate: (text: string) => void): void => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('Speech recognition is not supported in this browser');
  }
  
  try {
    recognition = initRecognition();
    
    // Keep track of the full transcription
    let fullTranscription = '';
    
    // Handle result event
    recognition.onresult = (event) => {
      let interimTranscription = '';
      
      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          fullTranscription += ' ' + transcript;
        } else {
          interimTranscription += transcript;
        }
      }
      
      // Combine full and interim transcriptions
      const currentTranscription = (fullTranscription + ' ' + interimTranscription).trim();
      onTranscriptionUpdate(currentTranscription);
    };
    
    // Handle end event (restart recognition to keep it continuous)
    recognition.onend = () => {
      if (recognition) { // Only restart if we haven't explicitly stopped
        recognition.start();
      }
    };
    
    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    
    // Start recognition
    recognition.start();
    
  } catch (error) {
    console.error('Failed to start speech recognition:', error);
    throw error;
  }
};

// Stop speech recognition
export const stopRecognition = (): void => {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
};
