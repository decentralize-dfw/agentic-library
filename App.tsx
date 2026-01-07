import React, { useState, useEffect } from 'react';
import { CHARACTERS } from './constants';
import { Character } from './types';
import ChatInterface from './components/ChatInterface';
import { Users, Search, BookOpen, Sparkles } from 'lucide-react';

// Loading Screen Component
const LoadingScreen: React.FC<{ character: Character; onComplete: () => void }> = ({ character, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const loadingTexts = [
      'Initializing...',
      'Loading 3D Model...',
      'Preparing animations...',
      'Setting up voice...',
      'Almost ready...',
    ];

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingTexts.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-dark-300 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8 max-w-md px-6">
        {/* Avatar with glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl floating">
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Character Info */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">{character.name}</h2>
          <p className="text-gray-400">{character.title}</p>
        </div>

        {/* Loading Bar */}
        <div className="w-full space-y-3">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{loadingText}</span>
            <span className="text-gray-400">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="text-center italic text-gray-500 text-sm max-w-xs">
          "{character.description}"
        </blockquote>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCharacters = CHARACTERS.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowChat(true);
  };

  const handleBack = () => {
    setSelectedCharacter(null);
    setShowChat(false);
  };

  // Show loading screen
  if (selectedCharacter && isLoading) {
    return <LoadingScreen character={selectedCharacter} onComplete={handleLoadingComplete} />;
  }

  // Show chat interface
  if (selectedCharacter && showChat) {
    return <ChatInterface character={selectedCharacter} onBack={handleBack} />;
  }

  // Character selection grid
  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Hero Header */}
      <div className="sticky top-0 z-10 bg-dark-300/95 backdrop-blur-md border-b border-white/5 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                Literary Avatars
              </h1>
              <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Immersive voice chat with {CHARACTERS.length} historical figures
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search author or poet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-100 border border-gray-700 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCharacters.map((char, index) => (
            <button
              key={char.id}
              onClick={() => handleCharacterSelect(char)}
              className="group relative flex flex-col items-center bg-dark-100 rounded-xl p-3 border border-white/5 hover:border-blue-500/50 hover:bg-dark-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={char.avatarUrl}
                  alt={char.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Play indicator on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-blue-500/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>

              <div className="text-center w-full">
                <h3 className="font-semibold text-sm truncate text-gray-200 group-hover:text-blue-400 transition-colors">
                  {char.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">{char.title}</p>
              </div>

              <div className="absolute top-2 right-2 bg-blue-600/20 text-blue-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Users size={12} />
              </div>
            </button>
          ))}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-fade-in">
            <Users size={48} className="mb-4 opacity-50" />
            <p>No characters found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 text-sm">
          <p>Powered by Gemini AI & VRM Avatars</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
