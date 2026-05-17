import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PiggyBank, Plus, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react';

export default function Expenses({ onRefresh }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentacao');
  const [submitting, setSubmitting] = useState(false);
  
  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Alimentacao');

  const categories = [
    'Aluguel',
    'Alimentacao',
    'Energia',
    'Internet',
    'Transporte',
    'Saude',
    'Lazer',
    'Outros'
  ];

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalBudget = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    try {
      await api.createExpense({
        name: name.trim(),
        amount: parseFloat(amount),
        category
      });
      setName('');
      setAmount('');
      setCategory('Alimentacao');
      await fetchExpenses();
      onRefresh();
    } catch (error) {
      alert(error.message || 'Erro ao criar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (exp) => {
    setEditingId(exp.id);
    setEditName(exp.name);
    setEditAmount(exp.amount.toString());
    setEditCategory(exp.category);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim() || !editAmount || parseFloat(editAmount) <= 0) return;
    try {
      await api.updateExpense(id, {
        name: editName.trim(),
        amount: parseFloat(editAmount),
        category: editCategory
      });
      setEditingId(null);
      await fetchExpenses();
      onRefresh();
    } catch (error) {
      alert(error.message || 'Erro ao salvar despesa');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir esta despesa? Os lançamentos vinculados a ela serão deletados e as proporções recalculadas.')) return;
    try {
      await api.deleteExpense(id);
      await fetchExpenses();
      onRefresh();
    } catch (error) {
      alert(error.message || 'Erro ao excluir despesa');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Despesas Mensais</h2>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Cadastre suas despesas fixas. O sistema gera a distribuição percentual.</p>
      </div>

      {/* Main Expense Creation Form */}
      <div className="glass rounded-2xl p-4 border border-dark-border shadow-md">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Nova Despesa Fixa</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Nome da Despesa</label>
              <input
                type="text"
                placeholder="ex: Aluguel do apartamento"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-dark-input border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Valor Alvo (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    className="w-full bg-dark-input border border-dark-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-dark-card text-slate-200">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !amount}
            className="w-full py-2 bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-xs font-bold text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {submitting ? 'Cadastrando...' : 'Cadastrar Meta de Despesa'}
          </button>
        </form>
      </div>

      {/* Target Sum Summary */}
      <div className="glass rounded-2xl px-4 py-3 border border-dark-border flex items-center justify-between text-xs shadow-sm bg-dark-card/30">
        <span className="text-slate-400 font-semibold">Orçamento Total Desejado</span>
        <span className="text-sm font-extrabold text-slate-100">
          {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* Expenses list */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Suas Metas & Percentuais</h3>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-500">Carregando despesas...</div>
        ) : expenses.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-xs font-bold text-slate-500 border-dashed border-dark-border/60">
            Nenhuma despesa cadastrada ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const isEditing = editingId === expense.id;
              const proportion = totalBudget > 0 ? (expense.amount / totalBudget) * 100 : 0;
              const formattedAmt = expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

              if (isEditing) {
                return (
                  <div key={expense.id} className="glass rounded-2xl p-4 border border-brand-primary/40 space-y-3 animate-pulse">
                    <div className="text-[9px] text-brand-primary font-bold uppercase tracking-wider">Editando Despesa</div>
                    
                    <div className="space-y-2.5">
                      <div>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-dark-input border border-dark-border rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-primary"
                          placeholder="Nome da despesa"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            className="w-full bg-dark-input border border-dark-border rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-brand-primary"
                            placeholder="Valor"
                          />
                        </div>
                        <div>
                          <select
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value)}
                            className="w-full bg-dark-input border border-dark-border rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-primary cursor-pointer"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat} className="bg-dark-card text-slate-200">{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-lg border border-dark-border text-slate-400 text-xs font-bold active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(expense.id)}
                        className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold active:scale-95 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Salvar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={expense.id} className="glass rounded-2xl p-3.5 border border-dark-border flex items-center justify-between transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm">
                      %
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-100">{expense.name}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-dark-input text-slate-400 font-bold uppercase border border-dark-border/40">
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-300 font-extrabold text-xs">{formattedAmt}</span>
                        <span className="text-[8px] text-dark-border">•</span>
                        <span className="text-[10px] text-brand-primary font-bold">{proportion.toFixed(1)}% do orçamento</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleStartEdit(expense)}
                      className="p-2 rounded-lg text-slate-500 hover:text-brand-primary active:scale-95 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-brand-danger active:scale-95 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
