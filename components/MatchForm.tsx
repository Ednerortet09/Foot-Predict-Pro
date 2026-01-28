
import React, { useState, useEffect } from 'react';
import { AVAILABLE_LEAGUES } from '../constants';
import LeagueSelector from './LeagueSelector';
import { FormData, RiskProfile, AnalysisMode } from '../types';
import { Sparkles, Loader2, Shield, ShieldAlert, ShieldCheck, Layers, CalendarDays, Radio, PlayCircle, Target } from 'lucide-react';

interface MatchFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  initialData?: FormData;
}

const MatchForm: React.FC<MatchFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(initialData?.analysisMode || 'pre-match');
  const [homeTeam, setHomeTeam] = useState(initialData?.homeTeam || '');
  const [awayTeam, setAwayTeam] = useState(initialData?.awayTeam || '');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(initialData?.selectedLeagues || AVAILABLE_LEAGUES.map(l => l.id));
  const [customOdd, setCustomOdd] = useState(initialData?.customOdd || '');
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(initialData?.riskProfile || 'Moderado');
  const [matchCount, setMatchCount] = useState<number>(initialData?.matchCount || 1);
  const [minConfidence, setMinConfidence] = useState<number>(initialData?.minConfidence || 70);
  const [loadingText, setLoadingText] = useState('Inicializando IA...');
  
  // Loading messages rotation
  useEffect(() => {
    if (isLoading) {
      const messages = [
        "A ligar aos servidores da Google Cloud...",
        "A extrair estatísticas do SofaScore...",
        "A consultar histórico no FlashScore...",
        "A comparar odds na Betano e Betclic...",
        "A calcular xG (Expected Goals) e probabilidades...",
        "A gerar a melhor estratégia de gestão de banca...",
      ];
      let i = 0;
      setLoadingText(messages[0]);
      const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingText(messages[i]);
      }, 3500); // Change message every 3.5 seconds
      return () => clearInterval(interval);
    }
  }, [isLoading]);
  
  // Get local date in YYYY-MM-DD format
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(initialData?.date || getLocalDate());

  // Effect to show/hide match count based on odd value
  useEffect(() => {
    const oddValue = parseFloat(customOdd);
    if (!isNaN(oddValue) && oddValue > 3 && matchCount === 1) {
      // Logic for visuals only
    }
  }, [customOdd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      homeTeam,
      awayTeam,
      selectedLeagues,
      customOdd,
      riskProfile,
      matchCount,
      date,
      minConfidence,
      analysisMode
    });
  };

  const isValid = selectedLeagues.length > 0;
  const showMatchCount = parseFloat(customOdd) >= 3.0 && (!homeTeam && !awayTeam) && analysisMode === 'pre-match';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
      
      {/* Mode Tabs */}
      <div className="flex p-1 bg-slate-950/80 rounded-xl mb-8 border border-slate-800 relative z-10">
        <button
          type="button"
          onClick={() => setAnalysisMode('pre-match')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
            analysisMode === 'pre-match'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarDays size={16} />
          Pré-Jogo
        </button>
        <button
          type="button"
          onClick={() => setAnalysisMode('live')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
            analysisMode === 'live'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/20 animate-pulse-slow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlayCircle size={16} />
          AO VIVO
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </button>
      </div>

      {/* Teams Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 block">
            Equipa Casa <span className="text-slate-500 text-xs">(Opcional)</span>
          </label>
          <input
            type="text"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            placeholder="Ex: Benfica"
            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 block">
            Equipa Fora <span className="text-slate-500 text-xs">(Opcional)</span>
          </label>
          <input
            type="text"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            placeholder="Ex: Porto"
            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Info Box */}
      {(!homeTeam && !awayTeam) && (
         <div className="mb-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-200 text-sm flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
            {analysisMode === 'live' 
              ? 'Modo AO VIVO: A IA irá procurar dados no SofaScore/FlashScore em tempo real.'
              : 'Sem equipas? A IA irá procurar os melhores jogos do dia.'}
         </div>
      )}

      <LeagueSelector 
        availableLeagues={AVAILABLE_LEAGUES}
        selectedLeagues={selectedLeagues}
        onChange={setSelectedLeagues}
      />

      {/* Advanced Options Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        
        {/* Date Picker (Only for Pre-match) */}
        {analysisMode === 'pre-match' ? (
          <div className="space-y-2">
            <label className="text-sm font-bold text-emerald-400 block flex items-center gap-2">
              <CalendarDays size={16} />
              Data dos Jogos
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all [color-scheme:dark]"
              required
            />
          </div>
        ) : (
          <div className="space-y-2 opacity-50 cursor-not-allowed">
             <label className="text-sm font-bold text-red-400 block flex items-center gap-2">
              <PlayCircle size={16} />
              Tempo Real
            </label>
            <div className="w-full bg-slate-950 border border-red-500/30 rounded-lg px-4 py-3 text-red-200 flex items-center">
              AGORA (Dados Live)
            </div>
          </div>
        )}

        {/* Odd Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 block">
            ODD Mínima Desejada
          </label>
          <input
            type="number"
            step="0.01"
            value={customOdd}
            onChange={(e) => setCustomOdd(e.target.value)}
            placeholder="Ex: 2.00 (Betano)"
            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Match Count (Conditional) */}
        {showMatchCount ? (
          <div className="space-y-2 animate-fade-in">
            <label className="text-sm font-medium text-emerald-400 block flex items-center gap-2">
              <Layers size={14} />
              Quantidade de Jogos
            </label>
            <select
              value={matchCount}
              onChange={(e) => setMatchCount(Number(e.target.value))}
              className="w-full bg-slate-950/50 border border-emerald-500/50 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} Jogos (Múltipla)</option>
              ))}
            </select>
          </div>
        ) : (
           <div className="hidden lg:block"></div>
        )}
      </div>

      {/* Confidence Slider */}
      <div className="mb-6 p-4 bg-slate-950/30 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Target size={16} className="text-purple-400" />
            Confiança Mínima (Baseada em Stats): <span className="text-white text-lg">{minConfidence}%</span>
          </label>
          <span className="text-xs text-slate-500">Maior % = Menos Jogos, Maior Assertividade</span>
        </div>
        <input 
          type="range" 
          min="50" 
          max="95" 
          step="5"
          value={minConfidence}
          onChange={(e) => setMinConfidence(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Arriscado (50%)</span>
          <span>Equilibrado (75%)</span>
          <span>Cirúrgico (95%)</span>
        </div>
      </div>

      {/* Risk Profile */}
      <div className="mb-8">
        <label className="text-sm font-medium text-slate-300 block mb-2">
          Perfil de Risco
        </label>
        <div className="flex flex-col sm:flex-row bg-slate-950/50 p-1.5 rounded-lg border border-slate-700 gap-1 sm:gap-0">
          {(['Conservador', 'Moderado', 'Arrojado'] as RiskProfile[]).map((profile) => {
            const isActive = riskProfile === profile;
            return (
              <button
                key={profile}
                type="button"
                onClick={() => setRiskProfile(profile)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2
                  ${isActive 
                    ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
              >
                {profile === 'Conservador' && <ShieldCheck size={16} className={isActive ? 'text-emerald-400' : ''} />}
                {profile === 'Moderado' && <Shield size={16} className={isActive ? 'text-blue-400' : ''} />}
                {profile === 'Arrojado' && <ShieldAlert size={16} className={isActive ? 'text-orange-400' : ''} />}
                {profile}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={`
          w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
          ${!isValid || isLoading 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
            : analysisMode === 'live' 
              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-red-500/20'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            <span className="animate-pulse">{loadingText}</span>
          </>
        ) : (
          <>
            {analysisMode === 'live' ? <PlayCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {analysisMode === 'live' ? 'Gerar Análise Live' : 'Gerar Análise'}
          </>
        )}
      </button>
    </form>
  );
};

export default MatchForm;
