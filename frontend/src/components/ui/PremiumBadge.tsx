import React from 'react';

interface PremiumBadgeProps {
  text: string;
  className?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ text, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center bg-white border border-slate-200/60 border-l-2 border-l-blue-600 px-3.5 py-1.5 rounded-lg shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md select-none ${className}`}
    >
      <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-500">
        {text}
      </span>
    </div>
  );
};
