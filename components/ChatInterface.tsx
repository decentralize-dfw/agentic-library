import React, { useState, useRef, useEffect } from 'react';
import { Character, ChatMessage, EmoteType } from '../types';
import { generateCharacterResponse, generateSpeech, playRawAudio } from '../services/geminiService';
import Avatar3D from './Avatar3D';
import { Send, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

interface ChatInterfaceProps {
  character: Character;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmote, setCurrentEmote] = useState<EmoteType>(EmoteType.IDLE);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio);
    return () => window.removeEventListener('click', initAudio);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pickRandomEmote = (): EmoteType => {
    const expressiveEmotes = [
       EmoteType.HAPPY_GREETING, EmoteType.AGREE, EmoteType.EXCITED, EmoteType.PROUD,
       EmoteType.GRATEFUL, EmoteType.LAUGHING, EmoteType.VICTORY, EmoteType.AMUSED,
       EmoteType.THINKING, EmoteType.CURIOUS, EmoteType.EXPLAINING, EmoteType.SERIOUS,
       EmoteType.MYSTERIOUS, EmoteType.SHOCKED, EmoteType.ARROGANT
    ];
    return expressiveEmotes[Math.floor(Math.random() * expressiveEmotes.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCurrentEmote(EmoteType.THINKING);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // 1. Get Text Response (Background)
    const responseText = await generateCharacterResponse(character.systemInstruction, userMsg.text, history);

    // 2. Prepare Audio (Background)
    let audioBase64: string | null = null;
    if (audioEnabled) {
      audioBase64 = await generateSpeech(responseText, character.voiceName);
    }

    // 3. Show Result & Play
    setIsLoading(false);
    
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMsg]);

    if (audioBase64 && audioContextRef.current) {
      const reactionEmote = pickRandomEmote();
      setCurrentEmote(reactionEmote);
      
      // Brief reaction then talk
      setTimeout(() => setCurrentEmote(EmoteType.TALKING), 1000);

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await playRawAudio(audioBase64, audioContextRef.current);
      
      setCurrentEmote(EmoteType.IDLE);
    } else {
       // Just visual reaction if no audio
       const reactionEmote = pickRandomEmote();
       setCurrentEmote(reactionEmote);
       setTimeout(() => setCurrentEmote(EmoteType.IDLE), 3000);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#111]">
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{character.name}</h1>
            <p className="text-xs text-gray-400">{character.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={`text-xs px-2 py-1 rounded border ${isLoading ? 'bg-yellow-900/30 border-yellow-700 text-yellow-500' : 'bg-green-900/30 border-green-700 text-green-500'}`}>
                {isLoading ? 'Thinking...' : 'Ready'}
            </div>
            <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-full ${audioEnabled ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
            >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="h-[45vh] md:h-full md:w-1/2 p-0 md:p-4 bg-black relative">
          <Avatar3D vrmUrl={character.vrmUrl} animationState={currentEmote} />
        </div>

        <div className="h-[55vh] md:h-full md:w-1/2 flex flex-col bg-[#111] border-l border-gray-800">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700">
                    <img src={character.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                </div>
                <p className="text-center text-gray-500">
                  Start a conversation with {character.name}.
                </p>
              </div>
            )}
            
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-[#2a2a2a] text-gray-200 rounded-bl-none border border-gray-700'
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] border border-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                   <div className="flex space-x-2 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[#1a1a1a] border-t border-gray-800">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Say something..."
                className="flex-1 bg-[#0f0f0f] border border-gray-700 text-white rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;
