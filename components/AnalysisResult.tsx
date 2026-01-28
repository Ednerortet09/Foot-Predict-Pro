
import React from 'react';
import { AnalysisResult as IAnalysisResult } from '../types';
import { Trophy, AlertTriangle, TrendingUp, Target, ShieldCheck, RefreshCw, Save, ArrowLeft, Calendar, Clock, Layers, Coins } from 'lucide-react';

interface Props {
  result: IAnalysisResult;
  onNewAnalysis: () => void;
  onBack: () => void;
  onSave: (result: IAnalysisResult) => void;
  isSaved?: boolean;
}

const AnalysisResult: React.FC<Props> = ({ result, onNewAnalysis, onBack, onSave, isSaved = false }) => {
  
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="animate-fade-in-up w-full max-w-5xl mx-auto space-y-6">
      
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors text-sm gap-2">
          <ArrowLeft size={18} /> Voltar
        </button>
        
        <div className="flex gap-2">
          {!isSaved && (
            <button 
              onClick={() => onSave(result)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              <Save size={16} /> Guardar
            </button>
          )}
          <button 
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
          >
            <RefreshCw size={16} /> Nova Análise
          </button>
        </div>
      </div>

      {/* Header Card (Strategy Overview) */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
           <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                  result.strategyType === 'Combinada' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {result.strategyType}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">{new Date(result.createdAt).toLocaleDateString()}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Estratégia {result.riskLevel}
              </h2>
           </div>
           <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-slate-400 uppercase text-xs font-semibold">Confiança</p>
                <p className={`text-3xl font-bold ${getConfidenceColor(result.confidenceScore)}`}>
                  {result.confidenceScore}%
                </p>
              </div>
              <div className="h-12 w-px bg-slate-700 hidden md:block"></div>
              <div className="text-right">
                <p className="text-sm text-slate-400 uppercase text-xs font-semibold">ODD Total</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {result.totalOdds.toFixed(2)}
                </p>
              </div>
           </div>
        </div>

        {/* Stake Recommendation Box */}
        {result.recommendedStake && (
          <div className="mt-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
             <div className="p-2 bg-yellow-500/10 rounded-full">
               <Coins className="w-5 h-5 text-yellow-500" />
             </div>
             <div>
               <p className="text-xs text-slate-400 font-semibold uppercase">Gestão de Banca Sugerida</p>
               <p className="text-white font-medium">{result.recommendedStake}</p>
             </div>
          </div>
        )}
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        <h3 className="text-slate-300 font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          Jogos Selecionados ({result.matches.length})
        </h3>
        
        {result.matches.map((match, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 md:p-6 relative hover:border-emerald-500/30 transition-all group">
            
            {/* Match Header */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-slate-800/50 pb-4">
              <div>
                <div className="text-emerald-500 text-xs font-bold uppercase tracking-wide mb-1">{match.competition}</div>
                <h4 className="text-xl font-bold text-white">{match.matchName}</h4>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{match.date}</span>
                </div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{match.time}</span>
                </div>
              </div>
            </div>

            {/* Match Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Prediction */}
              <div className="md:col-span-8">
                 <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-400 text-sm font-medium">Seleção Recomendada</span>
                 </div>
                 <div className="flex items-center gap-4 mb-3">
                   <span className="text-lg md:text-xl font-bold text-emerald-100 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                     {match.selection}
                   </span>
                   <span className="text-2xl font-bold text-emerald-400">@ {match.odds}</span>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-3">
                   {match.justification}
                 </p>
              </div>

              {/* Probabilities */}
              <div className="md:col-span-4 flex flex-col justify-center">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Probabilidades</span>
                  </div>
                  <div className="flex h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${match.probabilities.home}%` }} className="bg-emerald-500"></div>
                    <div style={{ width: `${match.probabilities.draw}%` }} className="bg-slate-500"></div>
                    <div style={{ width: `${match.probabilities.away}%` }} className="bg-blue-500"></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                     <div className="text-center">
                       <div className="text-emerald-500">{match.probabilities.home}%</div>
                       <div className="text-slate-600 scale-75 origin-top">Casa</div>
                     </div>
                     <div className="text-center">
                       <div className="text-slate-400">{match.probabilities.draw}%</div>
                       <div className="text-slate-600 scale-75 origin-top">Emp</div>
                     </div>
                     <div className="text-center">
                       <div className="text-blue-500">{match.probabilities.away}%</div>
                       <div className="text-slate-600 scale-75 origin-top">Fora</div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Factors & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Fatores Chave
          </h3>
          <ul className="space-y-2">
            {result.keyFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Avisos de Risco
          </h3>
          <ul className="space-y-2">
            {result.alerts.map((alert, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                 <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                 {alert}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default AnalysisResult;
