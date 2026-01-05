import React, { useState } from 'react';
import { CHARACTERS } from './constants';
import { Character } from './types';
import ChatInterface from './components/ChatInterface';
import { Users, Search } from 'lucide-react';

const App: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCharacters = CHARACTERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCharacter) {
    return (
      <ChatInterface 
        character={selectedCharacter} 
        onBack={() => setSelectedCharacter(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Hero Header */}
      <div className="sticky top-0 z-10 bg-[#121212]/95 backdrop-blur-sm border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Literary Avatars
            </h1>
            <p className="text-gray-400 mt-1">Immersive voice chat with 45 historical figures</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search author or poet..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCharacters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char)}
              className="group relative flex flex-col items-center bg-[#1e1e1e] rounded-xl p-3 border border-white/5 hover:border-blue-500/50 hover:bg-[#252525] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-800">
                <img 
                  src={char.avatarUrl} 
                  alt={char.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="text-center w-full">
                <h3 className="font-semibold text-sm truncate text-gray-200 group-hover:text-blue-400">{char.name}</h3>
                <p className="text-xs text-gray-500 truncate">{char.title}</p>
              </div>
              
              <div className="absolute top-2 right-2 bg-blue-600/20 text-blue-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Users size={12} />
              </div>
            </button>
          ))}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Users size={48} className="mb-4 opacity-50" />
            <p>No characters found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
