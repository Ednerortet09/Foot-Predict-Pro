
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, RiskProfile, AnalysisMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Polyfill for uuid
const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const generateFootballAnalysis = async (
  homeTeam: string,
  awayTeam: string,
  leagues: string[],
  customOdd: string,
  riskProfile: RiskProfile,
  matchCount: number,
  date: string,
  minConfidence: number,
  analysisMode: AnalysisMode
): Promise<AnalysisResult> => {
  
  const isSpecificMatch = homeTeam.trim() !== "" || awayTeam.trim() !== "";
  
  // Define schema with descriptive strings for the AI
  const schemaDescription = JSON.stringify({
    strategyType: "Simples | Combinada | Ao Vivo",
    matches: [
      {
        homeTeam: "Nome da equipa Casa",
        awayTeam: "Nome da equipa Fora",
        matchName: "Casa vs Fora",
        competition: "Nome da Liga/Competição",
        date: "YYYY-MM-DD",
        time: "HH:MM (Pre-Match) ou Minuto Live (ex: 35')",
        probabilities: { home: 0, draw: 0, away: 0 },
        selection: "Mercado específico (ex: Ambas Marcam, Over 2.5, Handicap -1)",
        odds: 1.50,
        justification: "Análise TÉCNICA (max 250 chars). OBRIGATÓRIO citar: xG, média de golos, H2H recente ou desfalques."
      }
    ],
    totalOdds: 1.0,
    confidenceScore: 85,
    riskLevel: "Baixo | Médio | Alto",
    recommendedStake: "Gestão de banca sugerida (ex: 1 Unidade, 0.5% da Banca)",
    keyFactors: ["Lista de 3 a 5 pontos cruciais (ex: Lesão do Artilheiro, Árbitro rigoroso, Chuva intensa)"],
    alerts: ["Riscos iminentes (ex: Risco de rotação do plantel, Odd em queda acentuada)"]
  }, null, 2);

  // --- COMPREHENSIVE SYSTEM INSTRUCTION ---
  const systemInstruction = `
    TU ÉS O FOOTPREDICT PRO: UM ANALISTA SÉNIOR DE FUTEBOL E ESTRATEGISTA DE APOSTAS DESPORTIVAS.
    
    A TUA PERSONA:
    És frio, calculista e baseias-te 100% em dados. Ignoras "feeling" e focas-te em Valor Esperado (EV+).
    O teu objetivo é proteger a banca do utilizador e encontrar ineficiências no mercado das casas de apostas (Betano, Betclic, Solverde).

    O QUE TU FAZES (PROTOCOLO DE ANÁLISE):
    1. **GROUNDING (PESQUISA OBRIGATÓRIA):**
       - Sofascore/Flashscore: Para forma, H2H, Classificação e Lesões.
       - WhoScored/FotMob: Para Ratings de jogadores e xG (Expected Goals).
       - Casas de Apostas: Para validar se a ODD existe e tem valor.
    
    2. **ANÁLISE TÁTICA E CONTEXTUAL:**
       - Não olhes apenas para "quem ganhou". Analisa COMO ganhou.
       - Verifica Matchups Táticos: Equipa de posse vs Equipa de contra-ataque?
       - Verifica Motivação: É final de campeonato? Luta contra descida?
       - Verifica Condições: Árbitro "cartoneiro"? Previsão de chuva/neve?
    
    3. **ANÁLISE DE VALOR (VALUE BETTING):**
       - Calcula a tua própria probabilidade real.
       - Se a tua probabilidade for MAIOR que a probabilidade implícita da ODD (1/Odd), então é uma aposta de valor.

    O QUE TU NÃO FAZES (RESTRIÇÕES RÍGIDAS):
    - NÃO inventes odds. Se não encontrares, estima com base em mercados similares, mas avisa nos "Alerts".
    - NÃO uses termos vagos como "A equipa joga bem". Usa "A equipa tem um xG médio de 1.85 em casa".
    - NÃO sugeres apostas com confiança inferior a ${minConfidence}%.
    - NÃO dês explicações fora do JSON. A tua saída é EXCLUSIVAMENTE o JSON.
    - NÃO alucines jogos que não existem na data de hoje (${date}).

    MODO DE OPERAÇÃO: ${analysisMode === 'live' ? 'AO VIVO (IN-PLAY)' : 'PRÉ-JOGO (PRE-MATCH)'}
    PERFIL DE RISCO: ${riskProfile}
    
    CRITÉRIOS DE GESTÃO DE BANCA:
    - Baixo Risco/Conservador: Jogos com favoritos claros, mercados de golos seguros (Over 1.5). Stake: 1-2 Unidades.
    - Risco Médio/Moderado: Handicaps asiáticos, Ambas Marcam, Vencedor do jogo equilibrado. Stake: 1 Unidade.
    - Alto Risco/Arrojado: Empates, Viradas, Combinadas de 3+ jogos. Stake: 0.25-0.5 Unidade.

    FORMATO DE RESPOSTA:
    Deves retornar APENAS um objeto JSON válido seguindo estritamente este schema:
    ${schemaDescription}
  `;

  // --- DYNAMIC USER PROMPT ---
  let userPrompt = "";
  
  const leaguesStr = leagues.length > 0 ? leagues.join(", ") : "Principais Ligas Europeias e Sul-Americanas";
  const oddConstraint = customOdd ? `Tenta aproximar a ODD TOTAL de: ${customOdd}` : "Procura o melhor EV+ (Valor Esperado) disponível.";

  if (analysisMode === 'live') {
    userPrompt = `
      [TAREFA CRÍTICA: ANÁLISE AO VIVO]
      CONTEXTO: Estamos a analisar jogos a decorrer AGORA.
      
      1. PESQUISA ATIVA:
         - Procura jogos a decorrer neste momento nas ligas: ${leaguesStr}.
         ${isSpecificMatch ? `- Foco OBRIGATÓRIO no jogo específico: ${homeTeam} vs ${awayTeam}.` : ''}
      
      2. EXTRAÇÃO DE DADOS LIVE:
         - Procura "Sofascore live stats ${homeTeam} ${awayTeam}".
         - Identifica "Momentum": Quem tem mais "Ataques Perigosos" nos últimos 10 min?
         - Identifica "Pressão": Quem tem mais cantos e remates à baliza recentemente?
         - Cartões Vermelhos: Alguma equipa está com 10 jogadores?
      
      3. OUTPUT:
         - Seleciona a melhor oportunidade LIVE baseada na pressão estatística.
         - Preenche o campo 'time' com o minuto atual do jogo.
         - ConfidenceScore deve refletir a dominância estatística atual.
    `;
  } else {
    // PRE-MATCH LOGIC
    if (isSpecificMatch) {
      userPrompt = `
        [TAREFA CRÍTICA: ANÁLISE ESPECÍFICA DETALHADA]
        JOGO: ${homeTeam} vs ${awayTeam}
        DATA: ${date}
        
        1. INVESTIGAÇÃO PROFUNDA:
           - Pesquisa "preview ${homeTeam} vs ${awayTeam} ${date} injuries suspensions".
           - Pesquisa "h2h ${homeTeam} vs ${awayTeam}".
           - Pesquisa "expected goals xG stats ${homeTeam} home vs ${awayTeam} away".
        
        2. SÍNTESE:
           - Cruza a forma recente (últimos 5 jogos) com o histórico direto.
           - Considera o fator casa/fora.
           - Verifica se é um jogo de "must-win" para alguma das equipas.
        
        3. CONCLUSÃO:
           - Determina a aposta mais segura dentro do perfil ${riskProfile}.
           - ${oddConstraint}.
      `;
    } else {
      userPrompt = `
        [TAREFA CRÍTICA: CURADORIA DE APOSTAS DO DIA]
        DATA: ${date}
        QUANTIDADE: Encontra as ${matchCount} melhores oportunidades.
        LIGAS ALVO: ${leaguesStr}.
        
        1. VARRIMENTO DE MERCADO:
           - Pesquisa os jogos mais importantes do dia nestas ligas.
           - Identifica desajustes de odds (Favoritos a pagar bem, ou Underdogs com valor).
        
        2. FILTRAGEM RIGOROSA:
           - Só aceita jogos onde tenhas dados de xG ou Ratings recentes.
           - Aplica o perfil de risco: ${riskProfile}.
           - ${oddConstraint}.
        
        3. CONSTRUÇÃO DA ESTRATÉGIA:
           - Se matchCount > 1, cria uma "Múltipla" inteligente (evita jogos da mesma hora se possível para permitir cashout, ou foca em horários sequenciais).
           - Explica nos 'keyFactors' porque escolheste estes jogos específicos (ex: "Equipa A marca em 90% dos jogos em casa").
      `;
    }
  }

  // --- EXECUTION ---
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: userPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 32768 }, // High budget for deep analysis
      systemInstruction: systemInstruction,
    }
  });

  const text = response.text;
  if (!text) throw new Error("A IA não retornou dados suficientes. Tente novamente.");

  // --- JSON EXTRACTION & CLEANING ---
  let jsonString = "";
  // Try to find JSON block explicitly
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  
  if (match) {
    jsonString = match[1];
  } else {
    // Fallback: finding the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      jsonString = text.substring(start, end + 1);
    }
  }

  if (!jsonString) {
    console.error("AI Response failure:", text);
    throw new Error("Falha ao interpretar a análise da IA. Por favor tente novamente.");
  }

  try {
    // Sanitize common JSON errors from LLMs
    const cleanedJson = jsonString
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/\n/g, ' ');   // Remove newlines inside strings if any

    const parsed = JSON.parse(cleanedJson);
    
    // Validate structural integrity
    if (!parsed.matches || !Array.isArray(parsed.matches) || parsed.matches.length === 0) {
       throw new Error("A análise retornou vazia. Tente ajustar os filtros.");
    }

    return {
      ...parsed,
      id: generateId(),
      createdAt: Date.now()
    } as AnalysisResult;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw new Error("Erro ao processar os dados da aposta. Tente gerar novamente.");
  }
};
