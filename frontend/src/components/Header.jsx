import React from 'react';
import { Calendar } from 'lucide-react';

export default function Header({ selectedMonth, selectedYear, onDateChange }) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleMonthChange = (e) => {
    onDateChange(parseInt(e.target.value, 10), selectedYear);
  };

  const handleYearChange = (e) => {
    onDateChange(selectedMonth, parseInt(e.target.value, 10));
  };

  const years = [2024, 2025, 2026, 2027, 2028];

  return (
    <header className="sticky top-0 z-40 glass px-5 py-3.5 flex items-center justify-between border-b border-dark-border">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-sm text-white shadow-md shadow-brand-primary/10">
          NL
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          NightLedger
        </span>
      </div>
      
      <div className="flex items-center gap-1 bg-dark-input rounded-full px-3 py-1.5 border border-dark-border text-xs">
        <Calendar className="w-3.5 h-3.5 text-brand-primary mr-1" />
        <select 
          value={selectedMonth} 
          onChange={handleMonthChange}
          className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
        >
          {months.map((m, idx) => (
            <option key={m} value={idx + 1} className="bg-dark-card text-slate-200">
              {m.slice(0, 3)}
            </option>
          ))}
        </select>
        <span className="text-dark-border px-0.5">/</span>
        <select 
          value={selectedYear} 
          onChange={handleYearChange}
          className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
        >
          {years.map(y => (
            <option key={y} value={y} className="bg-dark-card text-slate-200">
              {y}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
