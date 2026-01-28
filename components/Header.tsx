import React from 'react';
import { Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="text-center py-10">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Activity className="w-10 h-10 text-emerald-500" />
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
          FootPredict Pro
        </h1>
      </div>
      <p className="text-slate-400 max-w-2xl mx-auto px-4 text-sm md:text-base">
        Análises profissionais de futebol com IA. Probabilidades precisas, estratégias inteligentes.
        Selecione as ligas e deixe a IA encontrar o valor.
      </p>
    </div>
  );
};

export default Header;