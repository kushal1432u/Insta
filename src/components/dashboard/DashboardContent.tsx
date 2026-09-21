'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { DashboardMetrics, ChartDataPoint, HighlightCard, FilterState } from '@/types';
import { useDashboardMetrics } from '@/hooks/useDashboard';
import { useReels } from '@/hooks/useReels';
import { useAuth } from '@/hooks/useAuth';
import { useManageReels } from '@/hooks/useManageReels';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatINR, formatINRCompact, formatNumber, formatNumberCompact, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  Target,
  BarChart3,
  Edit,
  Trash2,
  ChevronDown,
  Info,
  Calendar,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { InstagramPreview } from '@/components/ui/instagram-preview';
import { ReelEditorDialog } from '@/components/dashboard/ReelEditorDialog';

// ─── Stat Card (100% Meta Ads Manager style) ────────────────────────────────
function StatCard({
  label,
  value,
  subValue,
  change,
  info,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  change?: number;
  info?: string;
}) {
  const isUp = change !== undefined && change >= 0;
  const isDown = change !== undefined && change < 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-1 hover:border-blue-500 hover:shadow-sm transition-all cursor-default group">
      <div className="flex items-center gap-1 text-[11px] text-[#65676B] font-semibold uppercase tracking-wide">
        {label}
        {info && (
          <span title={info}>
            <Info className="h-3 w-3 text-[#65676B] cursor-help opacity-60 group-hover:opacity-100" />
          </span>
        )}
      </div>
      <div className="text-[22px] font-bold text-[#1C1E21] tracking-tight leading-tight mt-1">
        {value}
      </div>
      {subValue && <div className="text-[11px] text-[#65676B] mt-0.5">{subValue}</div>}
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${isUp ? 'text-[#2DA44E]' : 'text-[#FA3E3E]'}`}>
          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {isUp ? '+' : ''}{change}% vs last period
        </div>
      )}
    </div>
  );
}

// ─── Meta-style Chart Card ────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DADDE1]">
        <h3 className="text-sm font-semibold text-[#1C1E21]">{title}</h3>
        <button className="flex items-center gap-1 text-xs text-[#65676B] hover:text-[#1C1E21] transition-colors">
          <BarChart3 className="h-3.5 w-3.5" />
          Chart
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Top Reels Table ──────────────────────────────────────────────────────────
function TopReelsTable({ reels, onRefetch }: { reels: any[]; onRefetch: () => void }) {
  const { isAdmin } = useAuth();
  const { deleteReel } = useManageReels();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<any | null>(null);

  const handleEdit = (reel: any) => { setEditingReel(reel); setEditorOpen(true); };
  const handleDelete = async (id: string) => {
    if (confirm('Delete this reel?')) {
      const ok = await deleteReel(id);
      if (ok) onRefetch();
    }
  };

  return (
    <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
      {/* Table header toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DADDE1]">
        <h3 className="text-sm font-semibold text-[#1C1E21]">Top Performing Reels</h3>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => { setEditingReel(null); setEditorOpen(true); }}
              className="flex items-center gap-1.5 bg-[#0064E0] hover:bg-[#0052C2] text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </button>
          )}
          <ExportButton reels={reels} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#DADDE1] bg-[#F8F9FA]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap w-10">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap w-12">Preview</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Ad Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Published</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Views</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Likes</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Comments</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Engagement</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Spend</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">CPM</th>
              {isAdmin && <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#65676B] whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {reels.slice(0, 10).map((reel, index) => (
              <tr key={reel.id} className="border-b border-[#DADDE1] hover:bg-[#F0F2F5] transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-[#0064E0]">{index + 1}</td>
                <td className="px-4 py-3">
                  <InstagramPreview url={reel.reel_url} size="small" />
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate text-[13px] font-medium text-[#1C1E21]">
                  {reel.title || 'Untitled'}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#65676B] whitespace-nowrap">
                  {formatDate(reel.published_date)}
                </td>
                <td className="px-4 py-3 text-right text-[13px] font-medium text-[#1C1E21]">
                  {formatNumber(reel.total_views)}
                </td>
                <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">
                  {formatNumber(reel.organic_likes)}
                </td>
                <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">
                  {formatNumber(reel.organic_comments)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[13px] font-semibold text-[#2DA44E]">
                    {reel.engagement_rate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[13px] font-medium text-[#1C1E21]">
                  {formatINR(reel.total_promotion_spend)}
                </td>
                <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">
                  {reel.cost_per_1k_views > 0 ? formatINR(reel.cost_per_1k_views) : '—'}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(reel)}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#E7F3FF] text-[#0064E0] transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(reel.id)}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-50 text-[#FA3E3E] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#DADDE1] flex items-center justify-between">
        <span className="text-xs text-[#65676B]">
          Showing top {Math.min(reels.length, 10)} of {reels.length} reels
        </span>
        <Link
          href="/dashboard/ads"
          className="text-xs font-semibold text-[#0064E0] hover:underline flex items-center gap-1"
        >
          View all ads
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {editorOpen && (
        <ReelEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          initialData={editingReel}
          onSaved={onRefetch}
        />
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'adsets' | 'ads'>('overview');
  const [filters, setFilters] = useState<FilterState>({
    date_from: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
    campaign_ids: [],
    min_views: null,
    max_views: null,
    min_engagement_rate: null,
    max_engagement_rate: null,
    usernames: [],
  });

  const { metrics, charts, highlights, loading, error, refetch } = useDashboardMetrics(filters);
  const { reels, refetch: refetchReels } = useReels({ filters, pageSize: 50 });

  const handleRefetch = () => { refetch(); refetchReels(); };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Loading skeleton */}
        <div className="bg-white border border-[#DADDE1] rounded-lg h-14 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-[#DADDE1] rounded-lg h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-[#DADDE1] rounded-lg h-72 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#DADDE1] rounded-lg p-8 text-center">
        <p className="text-[#FA3E3E] text-sm font-medium mb-3">Failed to load dashboard: {error}</p>
        <button
          onClick={refetch}
          className="bg-[#0064E0] hover:bg-[#0052C2] text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">
      {/* ── Page Title Bar ─────────────────────────────────────── */}
      <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
        {/* Title row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DADDE1]">
          <div>
            <h1 className="text-xl font-bold text-[#1C1E21]">Campaigns</h1>
            <p className="text-xs text-[#65676B] mt-0.5">Instagram Reel Promotion Analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker
              from={filters.date_from}
              to={filters.date_to}
              onChange={(range) => setFilters({ ...filters, date_from: range.from, date_to: range.to })}
            />
          </div>
        </div>

        {/* Tabs row */}
        <div className="flex border-b border-[#DADDE1] bg-white px-3">
          {(['overview', 'campaigns', 'adsets', 'ads'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[#0064E0] text-[#0064E0]'
                  : 'border-transparent text-[#65676B] hover:text-[#1C1E21] hover:border-[#DADDE1]'
              }`}
            >
              {tab === 'adsets' ? 'Ad Sets' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards Grid ────────────────────────────────────── */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Amount Spent"
            value={formatINR(metrics.total_promotion_spend)}
            info="Total ad spend in INR"
            subValue="via UPI: taraibabu@ybl"
          />
          <StatCard
            label="Reach"
            value={formatNumberCompact(metrics.total_views)}
            info="Unique accounts reached"
          />
          <StatCard
            label="Impressions"
            value={formatNumberCompact(metrics.total_views)}
            info="Total times ads were shown"
          />
          <StatCard
            label="Total Reels"
            value={formatNumber(metrics.total_reels)}
            info="Total promoted reels"
          />
          <StatCard
            label="Engagement"
            value={formatNumberCompact(metrics.total_engagement)}
            info="Likes + comments + shares"
          />
          <StatCard
            label="Eng. Rate"
            value={`${metrics.engagement_rate}%`}
            info="Engagement / Impressions"
            change={2.4}
          />
        </div>
      )}

      {/* ── Charts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.viewsOverTime.length > 0 && (
          <ChartCard title="Views Over Time">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.viewsOverTime}>
                  <defs>
                    <linearGradient id="metaBlueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0064E0" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0064E0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DADDE1" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#65676B' }}
                    tickFormatter={(v) => format(new Date(v + '-01'), 'MMM yy')}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#65676B' }}
                    tickFormatter={(v) => formatNumberCompact(v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ border: '1px solid #DADDE1', borderRadius: 6, fontSize: 12 }}
                    formatter={(v: number) => [formatNumber(v), 'Views']}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#0064E0"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#metaBlueGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {charts.engagementOverTime.length > 0 && (
          <ChartCard title="Engagement Over Time">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.engagementOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DADDE1" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#65676B' }}
                    tickFormatter={(v) => format(new Date(v + '-01'), 'MMM yy')}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#65676B' }}
                    tickFormatter={(v) => formatNumberCompact(v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ border: '1px solid #DADDE1', borderRadius: 6, fontSize: 12 }}
                    formatter={(v: number, name: string) => [
                      formatNumber(v),
                      name === 'engagement' ? 'Engagement' : name === 'views' ? 'Views' : 'Spend',
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="engagement" stroke="#0064E0" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="views" stroke="#833AB4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      {/* ── Campaign Comparison ─────────────────────────────────── */}
      {charts.campaignComparison.length > 0 && (
        <ChartCard title="Campaign Comparison">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.campaignComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#DADDE1" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#65676B' }} tickFormatter={(v) => formatINRCompact(v)} axisLine={false} tickLine={false} />
                <YAxis dataKey="campaign_name" type="category" width={110} tick={{ fontSize: 11, fill: '#65676B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: '1px solid #DADDE1', borderRadius: 6, fontSize: 12 }}
                  formatter={(v: number, name: string) => [
                    name === 'spend' ? formatINR(v) : formatNumber(v),
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="spend" fill="#0064E0" name="Spend" radius={[0, 3, 3, 0]} />
                <Bar dataKey="views" fill="#7DB3F5" name="Views" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* ── Top Reels Table ────────────────────────────────────── */}
      {reels.length > 0 && <TopReelsTable reels={reels} onRefetch={handleRefetch} />}
    </div>
  );
}
