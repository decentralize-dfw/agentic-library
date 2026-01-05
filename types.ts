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
}

// 30 Defined Emotes + Idle states
export enum EmoteType {
  IDLE = 'IDLE',
  TALKING = 'TALKING',
  
  // Positive
  HAPPY_GREETING = 'HAPPY_GREETING',
  AGREE = 'AGREE',
  EXCITED = 'EXCITED',
  PROUD = 'PROUD',
  GRATEFUL = 'GRATEFUL',
  LAUGHING = 'LAUGHING',
  VICTORY = 'VICTORY',
  RELIEVED = 'RELIEVED',
  HOPEFUL = 'HOPEFUL',
  AMUSED = 'AMUSED',

  // Thinking/Neutral
  THINKING = 'THINKING',
  CURIOUS = 'CURIOUS',
  LISTENING = 'LISTENING',
  EXPLAINING = 'EXPLAINING',
  CONTEMPLATING = 'CONTEMPLATING',
  OBSERVING = 'OBSERVING',
  SERIOUS = 'SERIOUS',
  MYSTERIOUS = 'MYSTERIOUS',

  // Negative/Intense
  ANGRY = 'ANGRY',
  DISAGREE = 'DISAGREE',
  SHOCKED = 'SHOCKED',
  SAD = 'SAD',
  DISAPPOINTED = 'DISAPPOINTED',
  SKEPTICAL = 'SKEPTICAL',
  ANNOYED = 'ANNOYED',
  FEARFUL = 'FEARFUL',
  ARROGANT = 'ARROGANT',
  CONFUSED = 'CONFUSED'
}
