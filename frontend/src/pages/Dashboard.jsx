import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, TrendingUp, PiggyBank, PlusCircle, Sparkles, Trash2, Edit2, Save, Plus, X, Wallet } from 'lucide-react';
import StatCard from '../components/StatCard';
import ExpenseProgressCard from '../components/ExpenseProgressCard';
import { api } from '../services/api';

export default function Dashboard({ data, onRefresh, onQuickIncome }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Accounts state
  const [accounts, setAccounts] = useState([]);
  const [loadingAcc, setLoadingAcc] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  
  // Edit account state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  const loadAccounts = async () => {
    setLoadingAcc(true);
    try {
      const list = await api.getAccounts();
      setAccounts(list);
    } catch (e) {
      console.error('Erro ao carregar contas:', e);
    } finally {
      setLoadingAcc(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

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

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!accName.trim()) return;

    try {
      await api.createAccount({
        name: accName.trim(),
        balance: parseFloat(accBalance) || 0.0
      });
      setAccName('');
      setAccBalance('');
      setShowAddForm(false);
      await loadAccounts();
      onRefresh();
    } catch (err) {
      alert(err.message || 'Erro ao criar conta');
    }
  };

  const startEditAccount = (acc) => {
    setEditingId(acc.id);
    setEditName(acc.name);
    setEditBalance(acc.balance.toString());
  };

  const handleUpdateAccount = async (id) => {
    if (!editName.trim()) return;

    try {
      await api.updateAccount(id, {
        name: editName.trim(),
        balance: parseFloat(editBalance) || 0.0
      });
      setEditingId(null);
      await loadAccounts();
      onRefresh();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar conta');
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta conta? O saldo dela deixará de ser somado.')) return;

    try {
      await api.deleteAccount(id);
      if (editingId === id) setEditingId(null);
      await loadAccounts();
      onRefresh();
    } catch (err) {
      alert(err.message || 'Erro ao excluir conta');
    }
  };

  const handlePayExpense = async (expenseId, accountId, customAmount) => {
    await api.payExpense(expenseId, accountId, customAmount);
    await loadAccounts(); // refresh bank balances
    onRefresh(); // refresh dashboard totals
  };

  const {
    totalExpensesNeeded = 0,
    totalGained = 0,
    totalReserved = 0,
    totalBankBalance = 0,
    freeBalance = 0,
    expenses = []
  } = data || {};

  const formattedTotalNeeded = totalExpensesNeeded.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedGained = totalGained.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedReserved = totalReserved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedBankBalance = totalBankBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedFreeBalance = freeBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Calculate percentage of general coverage
  const overallPercentageCovered = totalExpensesNeeded > 0 ? (totalReserved / totalExpensesNeeded) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 space-y-5">
      {/* Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-1.5">
            <span>Seu Painel</span> <Sparkles className="w-4 h-4 text-brand-warning animate-pulse" />
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Gestão contínua de despesas e saldos de caixa.</p>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 gap-3.5">
        <StatCard 
          title="Faturamento Mês" 
          value={formattedGained}
          icon={<TrendingUp className="w-4 h-4" />}
          subtext="Total recebido"
          color="brand"
        />
        <StatCard 
          title="Reservado P/ Contas" 
          value={formattedReserved}
          icon={<PiggyBank className="w-4 h-4" />}
          subtext={`Meta: ${formattedTotalNeeded}`}
          color="warning"
        />
        <StatCard 
          title="Saldo nos Bancos" 
          value={formattedBankBalance}
          icon={<Wallet className="w-4 h-4" />}
          subtext="Total líquido"
          color="brand"
        />
        <StatCard 
          title="Saldo Livre" 
          value={formattedFreeBalance}
          icon={<Percent className="w-4 h-4" />}
          subtext={freeBalance >= 0 ? "Disponível para gastar!" : "Atenção: déficit de caixa"}
          color={freeBalance >= 0 ? "success" : "danger"}
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

      {/* Accounts & Wallets Management Panel (Minhas Contas e Saldos) */}
      <div className="glass rounded-2xl p-4.5 border border-dark-border shadow-md space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Minhas Contas e Saldos</h3>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-6 h-6 rounded-lg bg-dark-input border border-dark-border flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Add Account Inline Form */}
        {showAddForm && (
          <form onSubmit={handleAddAccount} className="grid grid-cols-5 gap-2 bg-dark-input/60 p-3 rounded-xl border border-dark-border/40 animate-fadeIn">
            <input
              type="text"
              placeholder="Nome (Ex: Nubank)"
              value={accName}
              onChange={e => setAccName(e.target.value)}
              required
              className="col-span-2 bg-dark-input border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-brand-primary"
            />
            <div className="col-span-2 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                placeholder="Saldo Atual"
                value={accBalance}
                onChange={e => setAccBalance(e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-brand-primary"
              />
            </div>
            <button
              type="submit"
              className="py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold shadow active:scale-[0.97] transition-all flex items-center justify-center"
            >
              Salvar
            </button>
          </form>
        )}

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <p className="text-[10px] text-slate-500 font-bold text-center py-2 uppercase tracking-wide">Nenhuma conta cadastrada.</p>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-2.5 bg-dark-input/30 border border-dark-border/40 rounded-xl">
                {editingId === acc.id ? (
                  /* Editing Mode Inline */
                  <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="col-span-2 bg-dark-input border border-dark-border rounded-lg px-2 py-1 text-xs text-slate-100 font-bold focus:outline-none focus:border-brand-primary"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editBalance}
                      onChange={e => setEditBalance(e.target.value)}
                      className="col-span-2 bg-dark-input border border-dark-border rounded-lg px-2 py-1 text-xs text-slate-100 font-bold focus:outline-none focus:border-brand-primary"
                    />
                    <div className="flex items-center gap-1.5 justify-end">
                      <button 
                        onClick={() => handleUpdateAccount(acc.id)}
                        className="p-1 rounded bg-brand-success/10 text-brand-success border border-brand-success/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded bg-dark-input text-slate-400 border border-dark-border"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-dark-input border border-dark-border flex items-center justify-center text-xs text-brand-primary font-bold">
                        💳
                      </div>
                      <span className="text-xs font-bold text-slate-200">{acc.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-100">
                        {acc.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditAccount(acc)}
                          className="p-1.5 rounded-lg bg-dark-input hover:text-white text-slate-400 border border-dark-border transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-1.5 rounded-lg bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress towards Goals Chart */}
      <div className="glass rounded-2xl p-4 border border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cobertura Geral das Metas</span>
          <span className="text-brand-primary font-extrabold text-xs">{overallPercentageCovered.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2.5 bg-dark-input rounded-full overflow-hidden mb-2 border border-dark-border/40">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-500"
            style={{ width: `${Math.min(100, overallPercentageCovered)}%` }}
          />
        </div>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-right">
          {formattedReserved} reservado de {formattedTotalNeeded}
        </p>
      </div>

      {/* Expenses list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contas Ativas e Ciclos</h3>
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
              <ExpenseProgressCard 
                key={expense.id} 
                expense={expense} 
                accounts={accounts}
                onPayExpense={handlePayExpense}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
