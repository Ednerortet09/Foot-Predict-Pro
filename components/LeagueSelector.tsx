import React from 'react';
import { Check } from 'lucide-react';
import { League } from '../types';

interface LeagueSelectorProps {
  availableLeagues: League[];
  selectedLeagues: string[];
  onChange: (leagues: string[]) => void;
}

const LeagueSelector: React.FC<LeagueSelectorProps> = ({ availableLeagues, selectedLeagues, onChange }) => {
  
  const toggleLeague = (id: string) => {
    if (selectedLeagues.includes(id)) {
      onChange(selectedLeagues.filter(l => l !== id));
    } else {
      onChange([...selectedLeagues, id]);
    }
  };

  const selectAll = () => onChange(availableLeagues.map(l => l.id));
  const clearAll = () => onChange([]);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h3 className="text-white font-semibold">
          Ligas Selecionadas ({selectedLeagues.length})
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={selectAll}
            type="button"
            className="text-xs px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Selecionar Todas
          </button>
          <button 
            onClick={clearAll}
            type="button"
            className="text-xs px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4 h-64 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableLeagues.map((league) => {
            const isSelected = selectedLeagues.includes(league.id);
            return (
              <div 
                key={league.id}
                onClick={() => toggleLeague(league.id)}
                className={`
                  cursor-pointer flex items-center gap-3 p-2 rounded-lg border transition-all duration-200
                  ${isSelected 
                    ? 'bg-emerald-500/10 border-emerald-500/50' 
                    : 'bg-slate-800/50 border-transparent hover:bg-slate-800'
                  }
                `}
              >
                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center border
                  ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}
                `}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
                <span className={`text-sm ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {league.name} <span className="opacity-50 text-xs">({league.country})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeagueSelector;