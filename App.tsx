import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MatchForm from './components/MatchForm';
import AnalysisResult from './components/AnalysisResult';
import SavedAnalyses from './components/SavedAnalyses';
import { generateFootballAnalysis } from './services/geminiService';
import { AnalysisResult as IAnalysisResult, FormData } from './types';
import { AlertCircle, History } from 'lucide-react';
import { AVAILABLE_LEAGUES } from './constants';

type ViewState = 'form' | 'result' | 'saved';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('form');
  const [analysis, setAnalysis] = useState<IAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State to preserve form data when navigating back
  const [formData, setFormData] = useState<FormData>({
    homeTeam: '',
    awayTeam: '',
    selectedLeagues: AVAILABLE_LEAGUES.map(l => l.id),
    customOdd: '',
    riskProfile: 'Moderado',
    matchCount: 1,
    date: new Date().toISOString().split('T')[0],
    minConfidence: 70,
    analysisMode: 'pre-match'
  });

  // Saved analyses from local storage
  const [savedAnalyses, setSavedAnalyses] = useState<IAnalysisResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('footpredict_saved');
    if (saved) {
      try {
        setSavedAnalyses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved analyses", e);
      }
    }
  }, []);

  const saveToStorage = (items: IAnalysisResult[]) => {
    setSavedAnalyses(items);
    localStorage.setItem('footpredict_saved', JSON.stringify(items));
  };

  const handleAnalysisRequest = async (data: FormData) => {
    setFormData(data); // Save for "Back" functionality
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      
      const result = await generateFootballAnalysis(
        data.homeTeam,
        data.awayTeam,
        data.selectedLeagues,
        data.customOdd,
        data.riskProfile,
        data.matchCount,
        data.date,
        data.minConfidence,
        data.analysisMode
      );

      const elapsedTime = Date.now() - startTime;
      const minTime = 1500;
      if (elapsedTime < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
      }

      setAnalysis(result);
      setView('result');
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar a análise. Verifique a sua conexão ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnalysis = (item: IAnalysisResult) => {
    const exists = savedAnalyses.some(s => s.id === item.id);
    if (!exists) {
      const newSaved = [item, ...savedAnalyses];
      saveToStorage(newSaved);
    }
  };

  const handleDeleteAnalysis = (id: string) => {
    const newSaved = savedAnalyses.filter(s => s.id !== id);
    saveToStorage(newSaved);
  };

  const handleLoadAnalysis = (item: IAnalysisResult) => {
    setAnalysis(item);
    setView('result');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white pb-20 px-4">
      
      <Header />

      <main className="container mx-auto">
        {/* Top Navigation (History) */}
        {view === 'form' && savedAnalyses.length > 0 && (
          <div className="flex justify-center mb-8 animate-fade-in">
            <button 
              onClick={() => setView('saved')}
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors px-4 py-2 rounded-full border border-slate-800 hover:border-emerald-500/30 bg-slate-900/50"
            >
              <History size={16} /> 
              Ver Histórico ({savedAnalyses.length})
            </button>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {view === 'form' && (
          <MatchForm 
            onSubmit={handleAnalysisRequest} 
            isLoading={isLoading} 
            initialData={formData}
          />
        )}

        {view === 'result' && analysis && (
          <AnalysisResult 
            result={analysis} 
            onNewAnalysis={() => {
              setAnalysis(null);
              setView('form');
            }}
            onBack={() => setView('form')}
            onSave={handleSaveAnalysis}
            isSaved={savedAnalyses.some(s => s.id === analysis.id)}
          />
        )}

        {view === 'saved' && (
          <SavedAnalyses 
            savedItems={savedAnalyses}
            onLoad={handleLoadAnalysis}
            onDelete={handleDeleteAnalysis}
            onBack={() => setView('form')}
          />
        )}
      </main>

      <footer className="mt-20 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} FootPredict Pro. Powered by Gemini AI.</p>
        <p className="text-xs mt-2 opacity-50">Apostas envolvem risco. Jogue com responsabilidade.</p>
      </footer>
    </div>
  );
};

export default App;