import { GoogleGenAI, Modality } from "@google/genai";
import { EmoteType, EMOTION_CATEGORIES } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the emotional content of a text response and returns the most appropriate emote
 */
export const analyzeEmotion = (text: string): EmoteType => {
  const lowerText = text.toLowerCase();

  // Define emotion keywords and their associated emotes
  const emotionPatterns: { keywords: string[]; emotes: EmoteType[] }[] = [
    // Positive/Happy
    {
      keywords: ['happy', 'joy', 'wonderful', 'delighted', 'fantastic', 'great', 'excellent', 'amazing', 'beautiful', 'love', 'adore', 'magnificent'],
      emotes: [EmoteType.HAPPY, EmoteType.JOYFUL, EmoteType.EXCITED, EmoteType.ENTHUSIASTIC]
    },
    // Greeting
    {
      keywords: ['hello', 'hi', 'greetings', 'welcome', 'good morning', 'good evening', 'pleasure to meet'],
      emotes: [EmoteType.HAPPY_GREETING, EmoteType.WARM]
    },
    // Laughter/Amusement
    {
      keywords: ['haha', 'lol', 'funny', 'hilarious', 'amusing', 'laugh', 'joke', 'wit', 'humor'],
      emotes: [EmoteType.LAUGHING, EmoteType.AMUSED, EmoteType.PLAYFUL]
    },
    // Pride/Confidence
    {
      keywords: ['proud', 'accomplished', 'achieved', 'success', 'triumph', 'victory', 'confident', 'certain'],
      emotes: [EmoteType.PROUD, EmoteType.CONFIDENT, EmoteType.TRIUMPHANT, EmoteType.VICTORY]
    },
    // Gratitude
    {
      keywords: ['thank', 'grateful', 'appreciate', 'blessed', 'fortunate'],
      emotes: [EmoteType.GRATEFUL, EmoteType.THANKFUL]
    },
    // Hope/Optimism
    {
      keywords: ['hope', 'hopeful', 'optimistic', 'bright', 'future', 'better', 'improve', 'possibility'],
      emotes: [EmoteType.HOPEFUL, EmoteType.OPTIMISTIC, EmoteType.INSPIRED]
    },
    // Agreement
    {
      keywords: ['agree', 'yes', 'indeed', 'exactly', 'precisely', 'correct', 'right', 'absolutely', 'certainly'],
      emotes: [EmoteType.AGREE, EmoteType.NODDING, EmoteType.APPROVING]
    },
    // Thinking/Pondering
    {
      keywords: ['think', 'perhaps', 'maybe', 'consider', 'ponder', 'reflect', 'contemplate', 'wonder', 'suppose'],
      emotes: [EmoteType.THINKING, EmoteType.PONDERING, EmoteType.CONTEMPLATING, EmoteType.REFLECTING]
    },
    // Curiosity
    {
      keywords: ['curious', 'interesting', 'intriguing', 'fascinating', 'wonder', 'question', 'why', 'how'],
      emotes: [EmoteType.CURIOUS, EmoteType.WONDERING, EmoteType.OBSERVING]
    },
    // Explaining/Teaching
    {
      keywords: ['let me explain', 'you see', 'the point is', 'understand', 'teach', 'lesson', 'learn', 'education'],
      emotes: [EmoteType.EXPLAINING, EmoteType.TEACHING, EmoteType.FOCUSED]
    },
    // Mystery
    {
      keywords: ['mystery', 'mysterious', 'secret', 'hidden', 'enigma', 'unknown', 'cryptic'],
      emotes: [EmoteType.MYSTERIOUS, EmoteType.ENIGMATIC]
    },
    // Serious
    {
      keywords: ['serious', 'grave', 'important', 'crucial', 'vital', 'critical', 'solemn'],
      emotes: [EmoteType.SERIOUS, EmoteType.FOCUSED, EmoteType.INTENSE]
    },
    // Anger/Frustration
    {
      keywords: ['angry', 'furious', 'outrage', 'infuriate', 'frustrat', 'annoy', 'irritat', 'absurd', 'ridiculous'],
      emotes: [EmoteType.ANGRY, EmoteType.FURIOUS, EmoteType.FRUSTRATED, EmoteType.IRRITATED, EmoteType.ANNOYED]
    },
    // Disagreement
    {
      keywords: ['disagree', 'no', 'wrong', 'incorrect', 'mistake', 'error', 'false', 'nonsense', 'refuse'],
      emotes: [EmoteType.DISAGREE, EmoteType.DISAPPROVING, EmoteType.SKEPTICAL]
    },
    // Shock/Surprise
    {
      keywords: ['shock', 'surprise', 'astonish', 'amaze', 'incredible', 'unbelievable', 'wow', 'unexpected', 'startl'],
      emotes: [EmoteType.SHOCKED, EmoteType.SURPRISED, EmoteType.STARTLED, EmoteType.AMAZED, EmoteType.AWE]
    },
    // Sadness
    {
      keywords: ['sad', 'sorrow', 'melanchol', 'grief', 'mourn', 'tragic', 'unfortunate', 'regret', 'miss', 'lost'],
      emotes: [EmoteType.SAD, EmoteType.MELANCHOLIC, EmoteType.NOSTALGIC, EmoteType.WISTFUL]
    },
    // Disappointment
    {
      keywords: ['disappoint', 'letdown', 'fail', 'unfortunate', 'alas', 'pity', 'shame'],
      emotes: [EmoteType.DISAPPOINTED, EmoteType.DEJECTED]
    },
    // Doubt/Skepticism
    {
      keywords: ['doubt', 'skeptic', 'suspicious', 'uncertain', 'unsure', 'question', 'really?'],
      emotes: [EmoteType.SKEPTICAL, EmoteType.DOUBTFUL, EmoteType.SUSPICIOUS]
    },
    // Confusion
    {
      keywords: ['confus', 'puzzle', 'bewilder', 'perplex', 'unclear', 'understand', "don't get"],
      emotes: [EmoteType.CONFUSED, EmoteType.PUZZLED, EmoteType.BEWILDERED]
    },
    // Fear/Anxiety
    {
      keywords: ['fear', 'afraid', 'worry', 'anxious', 'nervous', 'dread', 'terror', 'frighten'],
      emotes: [EmoteType.FEARFUL, EmoteType.ANXIOUS, EmoteType.WORRIED, EmoteType.NERVOUS]
    },
    // Arrogance
    {
      keywords: ['obviously', 'clearly', 'fool', 'simpleton', 'beneath', 'superior', 'peasant'],
      emotes: [EmoteType.ARROGANT, EmoteType.CONDESCENDING]
    },
    // Shyness
    {
      keywords: ['shy', 'bashful', 'embarrass', 'blush', 'modest', 'humble'],
      emotes: [EmoteType.SHY, EmoteType.BASHFUL, EmoteType.HUMBLE, EmoteType.MODEST]
    },
    // Drama/Passion
    {
      keywords: ['passion', 'dramatic', 'theatrical', 'soul', 'heart', 'intense', 'profound', 'deep'],
      emotes: [EmoteType.DRAMATIC, EmoteType.THEATRICAL, EmoteType.PASSIONATE, EmoteType.INTENSE]
    },
    // Boredom/Tiredness
    {
      keywords: ['bored', 'tired', 'exhaust', 'weary', 'dull', 'mundane', 'tedious', 'sleepy', 'yawn'],
      emotes: [EmoteType.BORED, EmoteType.TIRED, EmoteType.SLEEPY]
    },
    // Disgust
    {
      keywords: ['disgust', 'repuls', 'revolt', 'vile', 'gross', 'nauseate', 'sick'],
      emotes: [EmoteType.DISGUSTED, EmoteType.REPULSED]
    },
    // Relief
    {
      keywords: ['relief', 'reliev', 'finally', 'at last', 'phew', 'calm', 'peace', 'content', 'satisfy'],
      emotes: [EmoteType.RELIEVED, EmoteType.CALM, EmoteType.CONTENT, EmoteType.SATISFIED]
    },
    // Support/Encouragement
    {
      keywords: ['support', 'encourage', 'believe in', 'you can', 'keep going', 'strength'],
      emotes: [EmoteType.SUPPORTIVE, EmoteType.ENCOURAGING, EmoteType.WARM]
    },
    // Love/Warmth
    {
      keywords: ['love', 'dear', 'cherish', 'affection', 'warm', 'fond', 'care'],
      emotes: [EmoteType.LOVING, EmoteType.WARM]
    },
  ];

  // Score each emotion category
  let bestMatch: EmoteType | null = null;
  let highestScore = 0;

  for (const pattern of emotionPatterns) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
        // Extra weight for exact word matches
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(text)) {
          score += 0.5;
        }
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = pattern.emotes[Math.floor(Math.random() * pattern.emotes.length)];
    }
  }

  // Fallback based on punctuation and sentence structure
  if (!bestMatch || highestScore < 0.5) {
    if (text.includes('!') && text.includes('?')) {
      return EmoteType.SURPRISED;
    } else if (text.endsWith('!')) {
      return EmoteType.ENTHUSIASTIC;
    } else if (text.endsWith('?')) {
      return EmoteType.CURIOUS;
    } else if (text.includes('...')) {
      return EmoteType.CONTEMPLATING;
    }
    // Default to a neutral explaining pose
    return EmoteType.EXPLAINING;
  }

  return bestMatch;
};

/**
 * Get appropriate talking emote based on detected emotion
 */
export const getTalkingEmote = (emotion: EmoteType): EmoteType => {
  const positiveEmotes = EMOTION_CATEGORIES.positive;
  const negativeEmotes = EMOTION_CATEGORIES.negative;

  if (positiveEmotes.includes(emotion)) {
    return EmoteType.TALKING_EXCITED;
  } else if (negativeEmotes.includes(emotion)) {
    return EmoteType.TALKING_CALM;
  }
  return EmoteType.TALKING;
};

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
        temperature: 0.8,
        maxOutputTokens: 60,
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
