'use client';

import { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useAnalytics } from '@/hooks/useAnalytics';
import { OverviewCard } from '@/components/dashboard/OverviewCard';
import { ChevronDown, Download, BarChart3, Table2, Info, RefreshCw } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

const BREAKDOWNS = ['By Day', 'By Week', 'By Month', 'By Quarter'];
const METRIC_PRESETS = ['Performance', 'Delivery', 'Engagement', 'Video', 'Custom'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(2026, 6, 31), 1),
    to: new Date(2026, 6, 31),
  });

  const [breakdown, setBreakdown] = useState('By Month');
  const [metricPreset, setMetricPreset] = useState('Performance');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const { metrics, loading } = useAnalytics(dateRange);

  return (
    <div className="flex flex-col gap-4 max-w-[1400px]">

      {/* ── Page Header Panel ── */}
      <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DADDE1]">
          <div>
            <h1 className="text-xl font-bold text-[#1C1E21]">Analytics</h1>
            <p className="text-xs text-[#65676B] mt-0.5">
              {format(dateRange.from, 'MMM d, yyyy')} – {format(dateRange.to, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-[#DADDE1] text-[#65676B] hover:bg-[#F0F2F5] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5] transition-colors">
              <Download className="h-3.5 w-3.5 text-[#65676B]" />
              Export
            </button>
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

        {/* ── Filters Toolbar ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DADDE1] bg-[#F8F9FA] flex-wrap">
          {/* Breakdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#65676B] font-medium">Breakdown:</span>
            <div className="relative">
              <select
                value={breakdown}
                onChange={(e) => setBreakdown(e.target.value)}
                className="appearance-none bg-white border border-[#DADDE1] text-[13px] text-[#1C1E21] px-3 py-1.5 pr-7 rounded-md focus:outline-none focus:border-[#0064E0] transition-colors cursor-pointer font-medium"
              >
                {BREAKDOWNS.map(b => <option key={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#65676B] pointer-events-none" />
            </div>
          </div>

          {/* Metrics preset */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#65676B] font-medium">Metrics:</span>
            <div className="relative">
              <select
                value={metricPreset}
                onChange={(e) => setMetricPreset(e.target.value)}
                className="appearance-none bg-white border border-[#DADDE1] text-[13px] text-[#1C1E21] px-3 py-1.5 pr-7 rounded-md focus:outline-none focus:border-[#0064E0] transition-colors cursor-pointer font-medium"
              >
                {METRIC_PRESETS.map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#65676B] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-[#65676B]">
            <Info className="h-3.5 w-3.5" />
            <span>Data updates hourly</span>
          </div>

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-0.5 bg-white border border-[#DADDE1] rounded-md p-0.5">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${
                viewMode === 'chart' ? 'bg-[#0064E0] text-white' : 'text-[#65676B] hover:bg-[#F0F2F5]'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Chart
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-[#0064E0] text-white' : 'text-[#65676B] hover:bg-[#F0F2F5]'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-white border border-[#DADDE1] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, i) => (
            <OverviewCard key={i} metric={metric} />
          ))}
        </div>
      )}

      {/* ── Reporting Period Summary ── */}
      {!loading && metrics.length > 0 && (
        <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#DADDE1]">
            <h3 className="text-[13px] font-semibold text-[#1C1E21]">Reporting Period Summary</h3>
            <Info className="h-3.5 w-3.5 text-[#65676B]" />
            <span className="text-[12px] text-[#65676B]">
              {format(dateRange.from, 'MMM d')} – {format(dateRange.to, 'MMM d, yyyy')} · {breakdown}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 divide-x divide-[#DADDE1]">
            {metrics.slice(0, 6).map((metric, i) => (
              <div key={i} className="px-5 py-4 text-center hover:bg-[#F0F2F5] transition-colors cursor-default">
                <div className="text-[11px] text-[#65676B] font-medium mb-1 truncate">{metric.title}</div>
                <div className="text-lg font-bold text-[#1C1E21]">{metric.value}</div>
                {metric.change !== undefined && (
                  <div className={`text-[11px] font-medium mt-0.5 ${metric.changeDirection === 'up' ? 'text-[#2DA44E]' : 'text-[#FA3E3E]'}`}>
                    {metric.changeDirection === 'up' ? '↑' : '↓'} {metric.change}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Table view ── */}
      {viewMode === 'table' && !loading && metrics.length > 0 && (
        <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#DADDE1]">
            <h3 className="text-[13px] font-semibold text-[#1C1E21]">Metrics Table — {breakdown}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#DADDE1] bg-[#F8F9FA]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#65676B]">Metric</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#65676B]">Value</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-[#65676B]">Change</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, i) => (
                  <tr key={i} className="border-b border-[#DADDE1] hover:bg-[#F0F2F5] transition-colors">
                    <td className="px-5 py-3 text-[13px] font-medium text-[#1C1E21]">{metric.title}</td>
                    <td className="px-5 py-3 text-right text-[13px] font-semibold text-[#1C1E21]">{metric.value}</td>
                    <td className="px-5 py-3 text-right">
                      {metric.change !== undefined ? (
                        <span className={`text-[12px] font-semibold ${metric.changeDirection === 'up' ? 'text-[#2DA44E]' : 'text-[#FA3E3E]'}`}>
                          {metric.changeDirection === 'up' ? '↑' : '↓'} {metric.change}%
                        </span>
                      ) : (
                        <span className="text-[#65676B] text-[12px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
