import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a response using the Gemini 2.0 Flash model.
 * Optimized for speed and brevity.
 */
export const generateCharacterResponse = async (
  systemInstruction: string,
  userMessage: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const modelId = 'gemini-2.0-flash'; 
    
    // Append strict instruction for brevity
    const optimizedSystemInstruction = `${systemInstruction} IMPORTANT: Be extremely concise. Maximum 2 sentences. Speak fast and casually.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history, 
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      config: {
        systemInstruction: optimizedSystemInstruction,
        temperature: 0.8, // Slightly higher for more dynamic/faster feeling answers
        maxOutputTokens: 60, // STRICT LIMIT for speed
      }
    });

    return response.text || "...";
  } catch (error: any) {
    console.error("Text generation error details:", error);
    if (error.message?.includes('404')) {
        return "Model not found.";
    }
    return "Connection error.";
  }
};

/**
 * Generates speech from text using Gemini TTS.
 */
export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Speech generation error:", error);
    return null;
  }
};

// Helper for Audio Context decoding
export const playRawAudio = async (base64String: string, audioContext: AudioContext): Promise<void> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const dataInt16 = new Int16Array(bytes.buffer);
  const sampleRate = 24000; 
  const numChannels = 1;
  
  const frameCount = dataInt16.length;
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
  
  return new Promise((resolve) => {
    source.onended = () => resolve();
  });
};
