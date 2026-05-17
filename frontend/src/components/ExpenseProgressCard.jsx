import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExpenseProgressCard({ expense }) {
  const { name, category, amountNeeded, amountCovered, amountRemaining, percentageCovered, isCovered } = expense;

  const percentage = Math.min(100, Math.max(0, percentageCovered));

  // Determine progress bar color based on percentage
  const getBarColorClass = () => {
    if (isCovered) return 'bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    if (percentage > 50) return 'bg-brand-primary shadow-[0_0_8px_rgba(59,130,246,0.3)]';
    if (percentage > 15) return 'bg-brand-warning shadow-[0_0_8px_rgba(245,158,11,0.2)]';
    return 'bg-brand-danger shadow-[0_0_8px_rgba(239,68,68,0.2)]';
  };

  const getPercentageTextColor = () => {
    if (isCovered) return 'text-brand-success';
    if (percentage > 50) return 'text-brand-primary';
    if (percentage > 15) return 'text-slate-300';
    return 'text-brand-danger';
  };

  const formattedNeeded = amountNeeded.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedCovered = amountCovered.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedRemaining = amountRemaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Map category to modern emoji
  const categoryEmojis = {
    aluguel: '🏠',
    alimentacao: '🍔',
    energia: '⚡',
    internet: '🌐',
    transporte: '🚗',
    saude: '🏥',
    lazer: '🍿',
    outros: '📦'
  };

  const emoji = categoryEmojis[category.toLowerCase()] || '📝';

  return (
    <div className="glass rounded-2xl p-4.5 border border-dark-border shadow-md transition-transform duration-200 active:scale-[0.99]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-dark-input border border-dark-border flex items-center justify-center text-lg shadow-inner">
            <span role="img" aria-label={category}>{emoji}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 leading-tight">{name}</h4>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{category}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-extrabold ${getPercentageTextColor()}`}>
            {percentageCovered.toFixed(1)}%
          </span>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">coberto</p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-dark-input rounded-full overflow-hidden mb-3 border border-dark-border/40">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-dark-border/20">
        <div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Coletado</span>
          <span className="text-slate-300 font-bold text-[11px]">
            {formattedCovered} <span className="text-slate-500 text-[10px] font-normal">de</span> {formattedNeeded}
          </span>
        </div>
        <div className="text-right">
          {isCovered ? (
            <div className="flex items-center gap-1 text-brand-success font-extrabold text-[11px] py-0.5 px-2 rounded-lg bg-brand-success/10 border border-brand-success/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Quitada</span>
            </div>
          ) : (
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Falta Pagar</span>
              <span className="text-brand-warning font-extrabold text-[11px]">{formattedRemaining}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
