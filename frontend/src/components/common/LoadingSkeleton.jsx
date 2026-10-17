import React from 'react';

/**
 * LoadingSkeleton - General multi-line placeholder shimmer component
 */
export function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-slate-200 rounded-md"
          style={{ width: `${Math.max(40, 100 - ((index * 17) % 55))}%` }}
        />
      ))}
    </div>
  );
}

export function SchemeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
          <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-2"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded-md mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-2/3 bg-slate-200 rounded-lg"></div>
      <div className="h-4 w-1/3 bg-slate-200 rounded-md"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-slate-100 rounded-2xl"></div>
        <div className="h-28 bg-slate-100 rounded-2xl"></div>
        <div className="h-28 bg-slate-100 rounded-2xl"></div>
      </div>
      <div className="h-48 bg-slate-100 rounded-2xl"></div>
    </div>
  );
}

LoadingSkeleton.SchemeCardSkeleton = SchemeCardSkeleton;
LoadingSkeleton.DetailSkeleton = DetailSkeleton;

export default LoadingSkeleton;
