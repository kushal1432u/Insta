'use client';

import { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useAnalytics } from '@/hooks/useAnalytics';
import { OverviewCard } from '@/components/dashboard/OverviewCard';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(2026, 6, 31), 1), // July 4, 2026
    to: new Date(2026, 6, 31) // July 31, 2026
  });

  const { metrics, loading } = useAnalytics(dateRange);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <DateRangePicker
            from={format(dateRange.from, 'yyyy-MM-dd')}
            to={format(dateRange.to, 'yyyy-MM-dd')}
            onChange={(range) => {
              if (range.from && range.to) {
                setDateRange({ from: new Date(range.from), to: new Date(range.to) });
              }
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, i) => (
            <OverviewCard key={i} metric={metric} />
          ))}
        </div>
      )}
    </div>
  );
}
