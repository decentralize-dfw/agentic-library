export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  avatarUrl: string;
  vrmUrl: string;
  systemInstruction: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  emotion?: EmoteType;
}

// 50+ Defined Emotes with detailed body animations
export enum EmoteType {
  // === IDLE STATES (Multiple for variety) ===
  IDLE = 'IDLE',
  IDLE_RELAXED = 'IDLE_RELAXED',
  IDLE_ATTENTIVE = 'IDLE_ATTENTIVE',
  IDLE_CURIOUS = 'IDLE_CURIOUS',

  // === SPEAKING STATES ===
  TALKING = 'TALKING',
  TALKING_EXCITED = 'TALKING_EXCITED',
  TALKING_CALM = 'TALKING_CALM',

  // === POSITIVE EMOTIONS ===
  HAPPY = 'HAPPY',
  HAPPY_GREETING = 'HAPPY_GREETING',
  JOYFUL = 'JOYFUL',
  EXCITED = 'EXCITED',
  ENTHUSIASTIC = 'ENTHUSIASTIC',
  PROUD = 'PROUD',
  GRATEFUL = 'GRATEFUL',
  THANKFUL = 'THANKFUL',
  LAUGHING = 'LAUGHING',
  AMUSED = 'AMUSED',
  PLAYFUL = 'PLAYFUL',
  RELIEVED = 'RELIEVED',
  HOPEFUL = 'HOPEFUL',
  OPTIMISTIC = 'OPTIMISTIC',
  LOVING = 'LOVING',
  WARM = 'WARM',
  CONTENT = 'CONTENT',
  SATISFIED = 'SATISFIED',
  VICTORY = 'VICTORY',
  TRIUMPHANT = 'TRIUMPHANT',

  // === AGREEMENT/POSITIVE RESPONSE ===
  AGREE = 'AGREE',
  NODDING = 'NODDING',
  APPROVING = 'APPROVING',
  SUPPORTIVE = 'SUPPORTIVE',
  ENCOURAGING = 'ENCOURAGING',

  // === THINKING/NEUTRAL ===
  THINKING = 'THINKING',
  PONDERING = 'PONDERING',
  CURIOUS = 'CURIOUS',
  WONDERING = 'WONDERING',
  LISTENING = 'LISTENING',
  ATTENTIVE = 'ATTENTIVE',
  EXPLAINING = 'EXPLAINING',
  TEACHING = 'TEACHING',
  CONTEMPLATING = 'CONTEMPLATING',
  REFLECTING = 'REFLECTING',
  OBSERVING = 'OBSERVING',
  ANALYZING = 'ANALYZING',
  SERIOUS = 'SERIOUS',
  FOCUSED = 'FOCUSED',
  MYSTERIOUS = 'MYSTERIOUS',
  ENIGMATIC = 'ENIGMATIC',
  NEUTRAL = 'NEUTRAL',
  CALM = 'CALM',

  // === NEGATIVE/INTENSE EMOTIONS ===
  ANGRY = 'ANGRY',
  FURIOUS = 'FURIOUS',
  IRRITATED = 'IRRITATED',
  ANNOYED = 'ANNOYED',
  FRUSTRATED = 'FRUSTRATED',
  DISAGREE = 'DISAGREE',
  DISAPPROVING = 'DISAPPROVING',
  SHOCKED = 'SHOCKED',
  SURPRISED = 'SURPRISED',
  STARTLED = 'STARTLED',
  SAD = 'SAD',
  MELANCHOLIC = 'MELANCHOLIC',
  DISAPPOINTED = 'DISAPPOINTED',
  DEJECTED = 'DEJECTED',
  SKEPTICAL = 'SKEPTICAL',
  DOUBTFUL = 'DOUBTFUL',
  SUSPICIOUS = 'SUSPICIOUS',
  FEARFUL = 'FEARFUL',
  ANXIOUS = 'ANXIOUS',
  WORRIED = 'WORRIED',
  NERVOUS = 'NERVOUS',
  CONFUSED = 'CONFUSED',
  PUZZLED = 'PUZZLED',
  BEWILDERED = 'BEWILDERED',

  // === PERSONALITY TRAITS ===
  ARROGANT = 'ARROGANT',
  CONDESCENDING = 'CONDESCENDING',
  SHY = 'SHY',
  BASHFUL = 'BASHFUL',
  CONFIDENT = 'CONFIDENT',
  ASSERTIVE = 'ASSERTIVE',
  HUMBLE = 'HUMBLE',
  MODEST = 'MODEST',

  // === SPECIAL STATES ===
  DRAMATIC = 'DRAMATIC',
  THEATRICAL = 'THEATRICAL',
  PASSIONATE = 'PASSIONATE',
  INTENSE = 'INTENSE',
  BORED = 'BORED',
  TIRED = 'TIRED',
  SLEEPY = 'SLEEPY',
  DISGUSTED = 'DISGUSTED',
  REPULSED = 'REPULSED',
  NOSTALGIC = 'NOSTALGIC',
  WISTFUL = 'WISTFUL',
  INSPIRED = 'INSPIRED',
  AWE = 'AWE',
  AMAZED = 'AMAZED',
}

// Emotion categories for AI analysis
export const EMOTION_CATEGORIES = {
  positive: [
    EmoteType.HAPPY, EmoteType.HAPPY_GREETING, EmoteType.JOYFUL, EmoteType.EXCITED,
    EmoteType.ENTHUSIASTIC, EmoteType.PROUD, EmoteType.GRATEFUL, EmoteType.THANKFUL,
    EmoteType.LAUGHING, EmoteType.AMUSED, EmoteType.PLAYFUL, EmoteType.RELIEVED,
    EmoteType.HOPEFUL, EmoteType.OPTIMISTIC, EmoteType.LOVING, EmoteType.WARM,
    EmoteType.CONTENT, EmoteType.SATISFIED, EmoteType.VICTORY, EmoteType.TRIUMPHANT,
  ],
  agreement: [
    EmoteType.AGREE, EmoteType.NODDING, EmoteType.APPROVING, EmoteType.SUPPORTIVE,
    EmoteType.ENCOURAGING,
  ],
  thinking: [
    EmoteType.THINKING, EmoteType.PONDERING, EmoteType.CURIOUS, EmoteType.WONDERING,
    EmoteType.LISTENING, EmoteType.ATTENTIVE, EmoteType.CONTEMPLATING, EmoteType.REFLECTING,
    EmoteType.OBSERVING, EmoteType.ANALYZING,
  ],
  explaining: [
    EmoteType.EXPLAINING, EmoteType.TEACHING, EmoteType.SERIOUS, EmoteType.FOCUSED,
  ],
  mysterious: [
    EmoteType.MYSTERIOUS, EmoteType.ENIGMATIC,
  ],
  neutral: [
    EmoteType.NEUTRAL, EmoteType.CALM, EmoteType.IDLE, EmoteType.IDLE_RELAXED,
    EmoteType.IDLE_ATTENTIVE, EmoteType.IDLE_CURIOUS,
  ],
  negative: [
    EmoteType.ANGRY, EmoteType.FURIOUS, EmoteType.IRRITATED, EmoteType.ANNOYED,
    EmoteType.FRUSTRATED, EmoteType.DISAGREE, EmoteType.DISAPPROVING,
  ],
  surprise: [
    EmoteType.SHOCKED, EmoteType.SURPRISED, EmoteType.STARTLED, EmoteType.AMAZED, EmoteType.AWE,
  ],
  sad: [
    EmoteType.SAD, EmoteType.MELANCHOLIC, EmoteType.DISAPPOINTED, EmoteType.DEJECTED,
    EmoteType.NOSTALGIC, EmoteType.WISTFUL,
  ],
  doubt: [
    EmoteType.SKEPTICAL, EmoteType.DOUBTFUL, EmoteType.SUSPICIOUS, EmoteType.CONFUSED,
    EmoteType.PUZZLED, EmoteType.BEWILDERED,
  ],
  fear: [
    EmoteType.FEARFUL, EmoteType.ANXIOUS, EmoteType.WORRIED, EmoteType.NERVOUS,
  ],
  personality: [
    EmoteType.ARROGANT, EmoteType.CONDESCENDING, EmoteType.SHY, EmoteType.BASHFUL,
    EmoteType.CONFIDENT, EmoteType.ASSERTIVE, EmoteType.HUMBLE, EmoteType.MODEST,
  ],
  special: [
    EmoteType.DRAMATIC, EmoteType.THEATRICAL, EmoteType.PASSIONATE, EmoteType.INTENSE,
    EmoteType.BORED, EmoteType.TIRED, EmoteType.SLEEPY, EmoteType.DISGUSTED,
    EmoteType.REPULSED, EmoteType.INSPIRED,
  ],
};

// All idle emotes for random selection
export const IDLE_EMOTES = [
  EmoteType.IDLE,
  EmoteType.IDLE_RELAXED,
  EmoteType.IDLE_ATTENTIVE,
  EmoteType.IDLE_CURIOUS,
];

// Expressive emotes for reactions
export const EXPRESSIVE_EMOTES = [
  ...EMOTION_CATEGORIES.positive,
  ...EMOTION_CATEGORIES.explaining,
  ...EMOTION_CATEGORIES.mysterious,
  ...EMOTION_CATEGORIES.surprise,
  ...EMOTION_CATEGORIES.personality,
];
