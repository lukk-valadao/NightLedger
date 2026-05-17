import React from 'react';
import { BarChart3, TrendingUp, PiggyBank, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Summary({ data }) {
  const {
    totalExpensesNeeded = 0,
    totalGained = 0,
    totalCovered = 0,
    totalRemaining = 0,
    overallPercentageCovered = 0,
    expenses = []
  } = data || {};

  // Aggregate stats by category
  const categoriesMap = {};
  expenses.forEach(exp => {
    const cat = exp.category;
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = {
        name: cat,
        needed: 0,
        covered: 0
      };
    }
    categoriesMap[cat].needed += exp.amountNeeded;
    categoriesMap[cat].covered += exp.amountCovered;
  });

  const categoriesList = Object.values(categoriesMap).sort((a, b) => b.needed - a.needed);

  // Math metrics
  const surplus = Math.max(0, totalGained - totalExpensesNeeded);
  const formattedTotalNeeded = totalExpensesNeeded.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedGained = totalGained.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedCovered = totalCovered.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedRemaining = totalRemaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedSurplus = surplus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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

  const getEmoji = (catName) => categoryEmojis[catName.toLowerCase()] || '📝';

  // Recommendation builder
  const getInsights = () => {
    if (totalExpensesNeeded === 0) {
      return {
        title: 'Defina suas despesas',
        text: 'Comece cadastrando suas metas de despesas fixas para que o sistema possa realizar o rateio proporcional de seus ganhos.',
        icon: <HelpCircle className="w-5 h-5 text-brand-primary" />,
        color: 'border-brand-primary/20 bg-brand-primary/5'
      };
    }
    if (overallPercentageCovered >= 100) {
      return {
        title: 'Meta Batida! 🚀',
        text: `Parabéns! Você cobriu 100% das suas metas financeiras. Todo valor excedente de ${formattedSurplus} está livre e pode ser direcionado para reservas ou investimentos.`,
        icon: <ShieldCheck className="w-5 h-5 text-brand-success" />,
        color: 'border-brand-success/20 bg-brand-success/5'
      };
    }
    if (overallPercentageCovered > 60) {
      return {
        title: 'Quase lá!',
        text: `Você já quitou ${overallPercentageCovered.toFixed(1)}% das suas obrigações. Restam apenas ${formattedRemaining} para concluir as metas deste mês.`,
        icon: <Sparkles className="w-5 h-5 text-brand-primary" />,
        color: 'border-brand-primary/20 bg-brand-primary/5'
      };
    }
    return {
      title: 'Em andamento',
      text: `Você está na trilha. Com ${overallPercentageCovered.toFixed(1)}% das despesas cobertas, cada novo ganho lançado será dividido proporcionalmente para amortizar suas metas.`,
      icon: <TrendingUp className="w-5 h-5 text-brand-warning" />,
      color: 'border-brand-warning/20 bg-brand-warning/5'
    };
  };

  const insight = getInsights();

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-1.5">
          <span>Resumo Mensal</span>
        </h2>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Visão consolidada e saúde do seu orçamento.</p>
      </div>

      {/* Insights Message */}
      <div className={`glass rounded-2xl p-4 border flex gap-3 shadow-sm ${insight.color}`}>
        <div className="mt-0.5">{insight.icon}</div>
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{insight.title}</h4>
          <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">{insight.text}</p>
        </div>
      </div>

      {/* General Stats List */}
      <div className="glass rounded-2xl p-4 border border-dark-border space-y-3 shadow-md">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Métricas de Faturamento</h3>
        
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-dark-border/20">
            <span className="text-slate-400 font-medium">Total de Despesas Fixas</span>
            <span className="font-extrabold text-slate-100">{formattedTotalNeeded}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-dark-border/20">
            <span className="text-slate-400 font-medium">Total de Entradas Recebidas</span>
            <span className="font-extrabold text-brand-success">{formattedGained}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-dark-border/20">
            <span className="text-slate-400 font-medium">Total Coberto no Mês</span>
            <span className="font-extrabold text-brand-primary">{formattedCovered}</span>
          </div>
          {surplus > 0 ? (
            <div className="flex items-center justify-between pt-1">
              <span className="text-brand-success font-bold flex items-center gap-1">
                <span>Excedente Livre (Poupança)</span>
              </span>
              <span className="font-extrabold text-brand-success bg-brand-success/10 py-0.5 px-2.5 rounded-lg border border-brand-success/20">
                {formattedSurplus}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 font-medium">Meta Pendente Restante</span>
              <span className="font-extrabold text-brand-warning">{formattedRemaining}</span>
            </div>
          )}
        </div>
      </div>

      {/* Categories break-down list */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Distribuição por Categoria</h3>

        {categoriesList.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-xs text-slate-500 border-dashed border-dark-border/60">
            Nenhuma categoria de despesa registrada.
          </div>
        ) : (
          <div className="space-y-3">
            {categoriesList.map((cat) => {
              const percentage = cat.needed > 0 ? (cat.covered / cat.needed) * 100 : 0;
              const formattedNeeded = cat.needed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
              const formattedCovered = cat.covered.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

              return (
                <div key={cat.name} className="glass rounded-2xl p-4 border border-dark-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base" role="img" aria-label={cat.name}>{getEmoji(cat.name)}</span>
                      <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">{cat.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-brand-primary">{percentage.toFixed(0)}%</span>
                  </div>

                  <div className="w-full h-2 bg-dark-input rounded-full overflow-hidden mb-2 border border-dark-border/30">
                    <div 
                      className="h-full rounded-full bg-brand-primary transition-all duration-300"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    <span>Meta: {formattedNeeded}</span>
                    <span>Coberto: {formattedCovered}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
