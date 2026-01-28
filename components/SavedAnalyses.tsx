import React from 'react';
import { AnalysisResult } from '../types';
import { Calendar, ChevronRight, Trash2, Clock } from 'lucide-react';

interface Props {
  savedItems: AnalysisResult[];
  onLoad: (item: AnalysisResult) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const SavedAnalyses: React.FC<Props> = ({ savedItems, onLoad, onDelete, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm font-medium">
          &larr; Voltar
        </button>
        <h2 className="text-xl font-bold text-white">Análises Guardadas</h2>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
          <p className="text-slate-500">Ainda não guardou nenhuma análise.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedItems.map((item) => (
            <div key={item.id} className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl p-5 transition-all group relative">
               <div className="flex justify-between items-start">
                 <div className="cursor-pointer flex-1" onClick={() => onLoad(item)}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                        {item.strategyType}
                      </span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(item.createdAt).toLocaleDateString()}
                        <Clock size={10} className="ml-1" />
                        {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {item.matches.length > 1 
                        ? `${item.matches.length} Jogos Combinados` 
                        : item.matches[0]?.matchName || 'Análise Simples'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                       Odd Total: <span className="text-emerald-400 font-bold">{item.totalOdds.toFixed(2)}</span> • Risco: {item.riskLevel}
                    </p>
                 </div>
                 
                 <div className="flex flex-col gap-2 ml-4">
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => onLoad(item)}
                      className="p-2 text-slate-600 hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 md:hidden"
                    >
                      <ChevronRight size={16} />
                    </button>
                 </div>
               </div>
               
               <div 
                 onClick={() => onLoad(item)}
                 className="hidden md:flex absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 items-center text-emerald-500 text-sm font-bold transition-all cursor-pointer"
               >
                 Ver Análise <ChevronRight size={16} />
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedAnalyses;
