import React from 'react';

export const StatCard = ({ title, count, icon: Icon, color = 'indigo', subtitle }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    sky: 'bg-sky-50 text-sky-600 border-sky-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  const borderTop = {
    indigo: 'bg-indigo-600',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="bg-white p-5 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className={`absolute top-0 left-0 right-0 h-1 ${borderTop[color] || borderTop.indigo}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
            {count}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl border ${colorClasses[color] || colorClasses.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
