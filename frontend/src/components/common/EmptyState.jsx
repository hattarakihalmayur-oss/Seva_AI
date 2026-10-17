import React from 'react';
import { SearchX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No records found',
  description = 'Try adjusting your search criteria, keywords, or filters.',
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>

      {(actionLabel && actionTo) && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}

      {(actionLabel && onAction && !actionTo) && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
