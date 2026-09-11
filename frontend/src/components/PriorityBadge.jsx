import React from 'react';
import { Flame, ShieldAlert, ArrowDown } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const getStyle = () => {
    switch (priority) {
      case 'High':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <Flame className="w-3.5 h-3.5 mr-1 text-rose-600" />,
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />,
        };
      case 'Low':
      default:
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <ArrowDown className="w-3.5 h-3.5 mr-1 text-sky-600" />,
        };
    }
  };

  const style = getStyle();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg}`}>
      {style.icon}
      {priority}
    </span>
  );
};
