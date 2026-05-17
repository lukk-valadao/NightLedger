import React, { useState } from 'react';
import { DollarSign, Percent, TrendingUp, PiggyBank, PlusCircle, Sparkles } from 'lucide-react';
import StatCard from '../components/StatCard';
import ExpenseProgressCard from '../components/ExpenseProgressCard';

export default function Dashboard({ data, onRefresh, onQuickIncome }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    try {
      await onQuickIncome({
        amount: parseFloat(amount),
        notes: notes.trim() || null
      });
      setAmount('');
      setNotes('');
      setSuccessMsg('Ganho registrado e distribuído!');
      setTimeout(() => setSuccessMsg(''), 3000);
      onRefresh();
    } catch (error) {
      alert(error.message || 'Erro ao registrar ganho');
    } finally {
      setSubmitting(false);
    }
  };

  const {
    totalExpensesNeeded = 0,
    totalGained = 0,
    totalCovered = 0,
    totalRemaining = 0,
    overallPercentageCovered = 0,
    expenses = []
  } = data || {};

  const formattedTotalNeeded = totalExpensesNeeded.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedGained = totalGained.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedCovered = totalCovered.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedRemaining = totalRemaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
      {/* Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-1.5">
            <span>Seu Painel</span> <Sparkles className="w-4 h-4 text-brand-warning animate-pulse" />
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Resumo de distribuição de ganhos do mês.</p>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 gap-3.5">
        <StatCard 
          title="Ganhos no Mês" 
          value={formattedGained}
          icon={<TrendingUp className="w-4 h-4" />}
          subtext="Total recebido"
          color="success"
        />
        <StatCard 
          title="Falta Cobrir" 
          value={formattedRemaining}
          icon={<DollarSign className="w-4 h-4" />}
          subtext={`Meta: ${formattedTotalNeeded}`}
          color={totalRemaining > 0 ? "warning" : "success"}
        />
      </div>

      {/* Quick Add Income Form (Premium Rapid UX) */}
      <div className="glass rounded-2xl p-4 border border-brand-primary/20 shadow-lg glow-btn">
        <div className="flex items-center gap-2 mb-3">
          <PlusCircle className="w-4.5 h-4.5 text-brand-primary" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Lançar Ganho Rápido</h3>
        </div>
        
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                className="w-full bg-dark-input border border-dark-border rounded-xl pl-8 pr-2.5 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
            <div className="col-span-2 relative">
              <input
                type="text"
                placeholder="Obs..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-xl px-2.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !amount || parseFloat(amount) <= 0}
            className="w-full py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl text-xs font-bold text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {submitting ? 'Distribuindo...' : 'Lançar & Distribuir'}
          </button>
        </form>

        {successMsg && (
          <div className="mt-2 text-center text-[10px] font-bold text-brand-success bg-brand-success/10 py-1 rounded-lg border border-brand-success/20 animate-pulse">
            {successMsg}
          </div>
        )}
      </div>

      {/* Progress towards Goals Chart */}
      <div className="glass rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cobertura Geral</span>
          <span className="text-brand-primary font-extrabold text-xs">{overallPercentageCovered.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2.5 bg-dark-input rounded-full overflow-hidden mb-2 border border-dark-border/40">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500"
            style={{ width: `${Math.min(100, overallPercentageCovered)}%` }}
          />
        </div>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-right">
          {formattedCovered} coberto de {formattedTotalNeeded}
        </p>
      </div>

      {/* Expenses list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metas e Cobertura</h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase">{expenses.length} cadastradas</span>
        </div>

        {expenses.length === 0 ? (
          <div className="glass border-dashed border-dark-border/60 rounded-2xl p-8 text-center">
            <PiggyBank className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Nenhuma despesa cadastrada.</p>
            <p className="text-[10px] text-slate-500 mt-1">Toque na aba "Despesas" para adicionar metas mensais.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseProgressCard key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
