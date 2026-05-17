import React, { useState } from 'react';
import { CheckCircle2, X, Wallet } from 'lucide-react';

export default function ExpenseProgressCard({ expense, accounts = [], onPayExpense }) {
  const { id, name, category, amountNeeded, amountCovered, amountRemaining, percentageCovered, isCovered } = expense;

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [customPayAmount, setCustomPayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handlePayConfirm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const amt = customPayAmount !== '' ? parseFloat(customPayAmount) : amountCovered;
      await onPayExpense(id, selectedAccountId || null, amt);
      setShowPayModal(false);
      setSelectedAccountId('');
    } catch (error) {
      alert(error.message || 'Erro ao processar pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-dark-border/20">
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

        {/* Pay & Reset Cycle Trigger (Option 3) - Always visible for active control */}
        <button
          onClick={() => {
            setCustomPayAmount(amountCovered.toString());
            setShowPayModal(true);
          }}
          className="mt-3.5 w-full py-2 bg-brand-success/10 border border-brand-success/30 hover:bg-brand-success/20 rounded-xl text-[10px] font-bold text-brand-success flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Pagar & Resetar Progresso</span>
        </button>
      </div>

      {/* Pay Modal Overlay */}
      {showPayModal && (
        <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-md flex items-center justify-center p-5 z-50 animate-fadeIn">
          <div className="glass border border-dark-border rounded-3xl w-full max-w-sm overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                <span>Dar Baixa na Conta</span>
              </h3>
              <button 
                onClick={() => setShowPayModal(false)}
                className="w-7 h-7 rounded-full bg-dark-input border border-dark-border flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-dark-input rounded-2xl p-4 border border-dark-border/40 text-center space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Conta: {name}</p>
              
              <div className="space-y-1">
                <label className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider block">
                  Valor a ser Debitado/Resetado
                </label>
                <div className="relative w-40 mx-auto">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-success font-black text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={customPayAmount}
                    onChange={(e) => setCustomPayAmount(e.target.value)}
                    required
                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-8 pr-3 py-1 text-center text-sm font-black text-brand-success focus:outline-none focus:border-brand-success/50"
                  />
                </div>
              </div>

              <p className="text-[9px] text-slate-500 font-semibold leading-normal">
                Esse valor será debitado da conta escolhida e o progresso voltará a zero para novos rateios.
              </p>
            </div>

            <form onSubmit={handlePayConfirm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                  Debitar de qual Banco/Conta?
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full bg-dark-input border border-dark-border rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="">Apenas resetar (sem debitar saldo)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Saldo: {acc.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="py-2.5 bg-dark-input border border-dark-border text-xs font-bold text-slate-300 rounded-xl hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 bg-gradient-to-r from-brand-success to-emerald-600 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  {submitting ? 'Confirmando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
