import React from 'react';
import { LayoutDashboard, DollarSign, PiggyBank, BarChart3 } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'incomes', label: 'Ganhos', icon: DollarSign },
    { id: 'expenses', label: 'Despesas', icon: PiggyBank },
    { id: 'summary', label: 'Resumo', icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav py-2 px-6 flex items-center justify-around pb-5 shadow-2xl border-t border-dark-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none"
          >
            <div className={`p-1 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'text-brand-primary' 
                : 'text-slate-500'
            }`}>
              <Icon className={`w-5.5 h-5.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
            </div>
            <span className={`text-[10px] font-bold mt-0.5 tracking-wide transition-colors ${
              isActive ? 'text-brand-primary' : 'text-slate-500'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
