
export interface MatchPrediction {
  homeTeam: string;
  awayTeam: string;
  matchName: string;
  competition: string;
  date: string;
  time: string; // Pode ser hora "20:00" ou minuto "35'" para live
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  selection: string;
  odds: number;
  justification: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: number; // Timestamp
  strategyType: 'Simples' | 'Combinada' | 'Ao Vivo';
  matches: MatchPrediction[];
  totalOdds: number;
  confidenceScore: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  recommendedStake: string; // Ex: "1 Unidade" ou "2% da Banca" - NOVO CAMPO
  keyFactors: string[];
  alerts: string[];
}

export type RiskProfile = 'Conservador' | 'Moderado' | 'Arrojado';
export type AnalysisMode = 'pre-match' | 'live';

export interface FormData {
  homeTeam: string;
  awayTeam: string;
  selectedLeagues: string[];
  customOdd: string;
  riskProfile: RiskProfile;
  matchCount: number;
  date: string;
  minConfidence: number;
  analysisMode: AnalysisMode;
}

export interface League {
  id: string;
  name: string;
  country: string;
}
