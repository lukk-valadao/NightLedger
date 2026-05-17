import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, Calendar, FileText, Trash2, ChevronDown, ChevronUp, History } from 'lucide-react';

export default function Incomes({ onRefresh }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');

  // Helper to format local date as YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [date, setDate] = useState(getLocalDateString());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const data = await api.getIncomes();
      setIncomes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    try {
      // Send date as local noon to fully prevent timezone shifting bugs
      const localNoonDate = new Date(`${date}T12:00:00`);
      await api.createIncome({
        amount: parseFloat(amount),
        date: localNoonDate.toISOString(),
        notes: notes.trim() || null
      });
      setAmount('');
      setNotes('');
      setDate(getLocalDateString());
      await fetchIncomes();
      onRefresh();
    } catch (error) {
      alert(error.message || 'Erro ao registrar ganho');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este ganho? Os valores distribuídos para as despesas serão estornados.')) return;
    try {
      await api.deleteIncome(id);
      await fetchIncomes();
      onRefresh();
    } catch (error) {
      alert(error.message || 'Erro ao excluir ganho');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Ganhos Variáveis</h2>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Registre entradas e veja a distribuição proporcional instantânea.</p>
      </div>

      {/* Main Income form */}
      <div className="glass rounded-2xl p-4 border border-dark-border shadow-md">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Lançar Novo Ganho</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Valor do Ganho</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  className="w-full bg-dark-input border border-dark-border rounded-xl pl-8 pr-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Observação</label>
                <input
                  type="text"
                  placeholder="ex: Corrida Uber"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !amount || parseFloat(amount) <= 0}
            className="w-full py-2 bg-brand-success hover:bg-brand-success/90 rounded-xl text-xs font-bold text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {submitting ? 'Lançando...' : 'Lançar & Distribuir Renda'}
          </button>
        </form>
      </div>

      {/* History log list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Histórico de Ganhos</h3>
        </div>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-500">Carregando histórico...</div>
        ) : incomes.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-xs font-bold text-slate-500 border-dashed border-dark-border/60">
            Nenhum ganho registrado.
          </div>
        ) : (
          <div className="space-y-3.5">
            {incomes.map((income) => {
              const isExpanded = expandedId === income.id;
              const formattedDate = new Date(income.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const formattedAmt = income.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

              return (
                <div key={income.id} className="glass rounded-2xl border border-dark-border overflow-hidden transition-all duration-200">
                  {/* Summary Card */}
                  <div 
                    onClick={() => toggleExpand(income.id)}
                    className="p-3 flex items-center justify-between cursor-pointer active:bg-dark-input/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-success/10 border border-brand-success/20 text-brand-success flex items-center justify-center font-bold text-sm">
                        +
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-100">{formattedAmt}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-semibold">{formattedDate}</span>
                          {income.notes && (
                            <>
                              <span className="text-[8px] text-dark-border">•</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px] font-semibold">{income.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(income.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-danger active:scale-95 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded proportional distribution details */}
                  {isExpanded && (
                    <div className="bg-dark-input/10 border-t border-dark-border px-4 py-3 space-y-2 text-xs">
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider pb-1">
                        Distribuição Proporcional Automática:
                      </div>
                      
                      {income.allocations.length === 0 ? (
                        <div className="text-[10px] text-slate-500 italic">Nenhuma despesa ativa na hora da distribuição.</div>
                      ) : (
                        <div className="space-y-2">
                          {income.allocations.map((alloc) => (
                            <div key={alloc.id} className="flex items-center justify-between border-b border-dark-border/10 pb-1.5 last:border-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{alloc.expense?.name || 'Despesa'}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-bold">
                                  {alloc.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <span className="font-extrabold text-slate-300">
                                {alloc.amountAllocated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
