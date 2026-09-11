import React from 'react';
import { Clock, AlertCircle, PlayCircle, CheckCircle2 } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
        };
      case 'In Progress':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          icon: <PlayCircle className="w-3.5 h-3.5 mr-1 text-indigo-600" />,
        };
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />,
        };
      case 'Not Started':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />,
        };
    }
  };

  const style = getStyle();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
      {style.icon}
      {status}
    </span>
  );
};
