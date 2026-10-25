import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      {/* Title & Action Strip Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
          <div className="h-9 w-32 bg-indigo-100 rounded-xl" />
        </div>
      </div>

      {/* 4-Card Metric Strip Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-clean p-5 space-y-3 border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-20 bg-slate-300 rounded" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table Filter Toolbar Skeleton */}
      <div className="card-clean p-3 flex flex-col md:flex-row items-center justify-between gap-3 border-slate-200/80">
        <div className="h-9 w-full md:w-80 bg-slate-100 rounded-xl" />
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="h-8 w-28 bg-slate-100 rounded-lg" />
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="card-clean overflow-hidden border-slate-200/80">
        <div className="h-10 bg-slate-50 border-b border-slate-100 px-4 flex items-center justify-between">
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>
        <div className="divide-y divide-slate-100 p-2">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="py-3.5 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-slate-200 rounded" />
                  <div className="h-2.5 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="hidden sm:block h-3 w-24 bg-slate-100 rounded" />
              <div className="h-5 w-16 bg-slate-200 rounded-full" />
              <div className="h-7 w-20 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
