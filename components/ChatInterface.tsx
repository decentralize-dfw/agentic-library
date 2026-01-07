import React, { useState, useRef, useEffect } from 'react';
import { Character, ChatMessage, EmoteType } from '../types';
import { generateCharacterResponse, generateSpeech, playRawAudio, analyzeEmotion, getTalkingEmote } from '../services/geminiService';
import Avatar3D from './Avatar3D';
import { Send, ArrowLeft, Volume2, VolumeX, Loader2 } from 'lucide-react';

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
  const [modelLoaded, setModelLoaded] = useState(false);

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

    // 1. Get Text Response
    const responseText = await generateCharacterResponse(character.systemInstruction, userMsg.text, history);

    // 2. Analyze emotion from response
    const detectedEmotion = analyzeEmotion(responseText);

    // 3. Prepare Audio (Background)
    let audioBase64: string | null = null;
    if (audioEnabled) {
      audioBase64 = await generateSpeech(responseText, character.voiceName);
    }

    // 4. Show Result & Play
    setIsLoading(false);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
      emotion: detectedEmotion
    };
    setMessages(prev => [...prev, botMsg]);

    if (audioBase64 && audioContextRef.current) {
      // Show reaction emote first
      setCurrentEmote(detectedEmotion);

      // Brief reaction then transition to talking
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get appropriate talking style based on emotion
      const talkingEmote = getTalkingEmote(detectedEmotion);
      setCurrentEmote(talkingEmote);

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await playRawAudio(audioBase64, audioContextRef.current);

      // Return to idle after speaking
      setCurrentEmote(EmoteType.IDLE);
    } else {
      // Just visual reaction if no audio
      setCurrentEmote(detectedEmotion);
      setTimeout(() => setCurrentEmote(EmoteType.IDLE), 3000);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-dark-400">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-dark-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
              <img src={character.avatarUrl} className="w-full h-full object-cover" alt={character.name} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{character.name}</h1>
              <p className="text-xs text-gray-400">{character.title}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-2 ${
            isLoading
              ? 'bg-yellow-900/30 border-yellow-700 text-yellow-500'
              : modelLoaded
                ? 'bg-green-900/30 border-green-700 text-green-500'
                : 'bg-blue-900/30 border-blue-700 text-blue-500'
          }`}>
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </>
            ) : modelLoaded ? (
              'Ready'
            ) : (
              'Loading...'
            )}
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-full transition-colors ${
              audioEnabled
                ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
            }`}
            aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Avatar Section */}
        <div className="h-[45vh] md:h-full md:w-1/2 p-2 md:p-4 bg-black relative">
          <Avatar3D
            vrmUrl={character.vrmUrl}
            animationState={currentEmote}
            onModelLoaded={() => setModelLoaded(true)}
          />
        </div>

        {/* Chat Section */}
        <div className="h-[55vh] md:h-full md:w-1/2 flex flex-col bg-dark-400 border-l border-gray-800">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 shadow-lg">
                  <img src={character.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-gray-400">
                    Start a conversation with <span className="text-white font-medium">{character.name}</span>
                  </p>
                  <p className="text-gray-600 text-sm max-w-xs">
                    "{character.description}"
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-dark-100 text-gray-200 rounded-bl-none border border-gray-700'
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                  {msg.emotion && msg.role === 'model' && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {msg.emotion.replace(/_/g, ' ').toLowerCase()}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-dark-100 border border-gray-700 rounded-2xl rounded-bl-none px-5 py-4">
                  <div className="flex space-x-2 items-center">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-dark-200 border-t border-gray-800">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={modelLoaded ? "Say something..." : "Loading avatar..."}
                className="flex-1 bg-dark-500 border border-gray-700 text-white rounded-xl px-4 py-4 pr-14 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600 disabled:opacity-50"
                disabled={isLoading || !modelLoaded}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !modelLoaded}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
