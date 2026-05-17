import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Incomes from './pages/Incomes';
import Expenses from './pages/Expenses';
import Summary from './pages/Summary';
import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  // Dashboard consolidated data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard(selectedMonth, selectedYear);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Erro ao conectar ao servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const handleDateChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleQuickIncomeSubmit = async (incomeData) => {
    // API call to record daily gain, which will automatically distribute
    await api.createIncome(incomeData);
    // Refresh local state
    await fetchDashboardData();
  };

  // Switch display subpages
  const renderPage = () => {
    if (loading && !dashboardData) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-primary mb-3" />
          <span className="text-xs font-bold uppercase tracking-wider">Carregando painel...</span>
        </div>
      );
    }

    if (error && !dashboardData) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 text-brand-danger mb-3" />
          <h3 className="text-sm font-bold text-slate-100">Ops, algo deu errado!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
            {error}. Certifique-se de que o servidor Express e o banco de dados estão ativos.
          </p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-dark-input border border-dark-border text-xs font-bold text-slate-300 rounded-xl hover:text-white"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            data={dashboardData} 
            onRefresh={fetchDashboardData}
            onQuickIncome={handleQuickIncomeSubmit}
          />
        );
      case 'incomes':
        return (
          <Incomes 
            onRefresh={fetchDashboardData}
          />
        );
      case 'expenses':
        return (
          <Expenses 
            onRefresh={fetchDashboardData}
          />
        );
      case 'summary':
        return (
          <Summary 
            data={dashboardData}
          />
        );
      default:
        return (
          <Dashboard 
            data={dashboardData} 
            onRefresh={fetchDashboardData}
            onQuickIncome={handleQuickIncomeSubmit}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-dark-bg text-slate-100 font-sans pb-safe-bottom">
      {/* Top sticky app header */}
      <Header 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onDateChange={handleDateChange}
      />
      
      {/* Inner Dynamic Page Viewport */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-gradient-to-b from-dark-bg via-dark-bg to-dark-card/10">
        {renderPage()}
      </main>

      {/* Persistent Bottom Nav Bar */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
