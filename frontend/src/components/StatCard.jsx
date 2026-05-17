import React from 'react';

export default function StatCard({ title, value, icon, subtext, color = 'brand' }) {
  const borderColors = {
    brand: 'border-brand-primary/20',
    success: 'border-brand-success/20',
    warning: 'border-brand-warning/20',
    danger: 'border-brand-danger/20'
  };

  const textColors = {
    brand: 'text-brand-primary',
    success: 'text-brand-success',
    warning: 'text-brand-warning',
    danger: 'text-brand-danger'
  };

  const bgColors = {
    brand: 'bg-brand-primary/10',
    success: 'bg-brand-success/10',
    warning: 'bg-brand-warning/10',
    danger: 'bg-brand-danger/10'
  };

  return (
    <div className={`glass rounded-2xl p-4.5 flex flex-col justify-between border ${borderColors[color] || borderColors.brand} shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl ${bgColors[color] || bgColors.brand} ${textColors[color] || textColors.brand}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight leading-none">{value}</h3>
        {subtext && <p className="text-[11px] text-slate-400 font-semibold mt-1.5">{subtext}</p>}
      </div>
    </div>
  );
}
