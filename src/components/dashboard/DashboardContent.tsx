'use client';

import { useState } from 'react';
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
  ScatterChart,
  Scatter,
} from 'recharts';
import { DashboardMetrics, ChartDataPoint, CampaignComparisonPoint, HighlightCard, FilterState } from '@/types';
import { useDashboardMetrics } from '@/hooks/useDashboard';
import { useReels, useUsernames } from '@/hooks/useReels';
import { useAuth } from '@/hooks/useAuth';
import { useManageReels } from '@/hooks/useManageReels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatINR, formatINRCompact, formatNumber, formatNumberCompact, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  Target,
  Award,
  Filter,
  Download,
  Printer,
  Users,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { InstagramPreview } from '@/components/ui/instagram-preview';
import { ReelEditorDialog } from '@/components/dashboard/ReelEditorDialog';

const COLORS = ['#E1306C', '#833AB4', '#F77737', '#FCAF45', '#0095F6', '#262626'];

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend = 'neutral',
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-sm mt-1', trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground')}>
            <TrendingUp className="h-3 w-3" />
            <span>{change >= 0 ? '+' : ''}{change}%</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HighlightCardComponent({ card }: { card: HighlightCard }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    views: Eye,
    likes: Heart,
    comments: MessageCircle,
    engagement_rate: Target,
    spend: DollarSign,
    cost_efficiency: Award,
  };

  const IconComponent = iconMap[card.metric_type] || Eye;

  return (
    <Card className="h-full border-l-4 border-instagram-pink">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {card.reel_url && (
              <InstagramPreview url={card.reel_url} size="small" className="shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">{card.label}</p>
              <p className="text-lg font-semibold mt-1 truncate">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {card.reel_title || 'Untitled'}
              </p>
            </div>
          </div>
          <IconComponent className="h-6 w-6 text-instagram-pink/50 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function SpendVsViewsChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Promotion Spend vs Views
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="spend"
                name="Promotion Spend (₹)"
                tickFormatter={(v) => formatINRCompact(v)}
                type="number"
              />
              <YAxis
                dataKey="views"
                name="Total Views"
                tickFormatter={(v) => formatNumberCompact(v)}
                type="number"
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'spend' ? formatINR(value) : formatNumber(value),
                  name,
                ]}
              />
              <Legend />
              <Scatter
                name="Reels"
                data={data.map(d => ({ x: d.spend, y: d.views, spend: d.spend, views: d.views, reel_title: d.reel_title }))}
                fill="#E1306C"
                stroke="#E1306C"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ViewsOverTimeChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Views Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E1306C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v + '-01'), 'MMM yy')} />
              <YAxis tickFormatter={(v) => formatNumberCompact(v)} />
              <Tooltip formatter={(v: number) => [formatNumber(v), 'Views']} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#E1306C"
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function EngagementOverTimeChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Engagement Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v + '-01'), 'MMM yy')} />
              <YAxis tickFormatter={(v) => formatNumberCompact(v)} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  formatNumber(v),
                  name === 'engagement' ? 'Engagement' : name === 'views' ? 'Views' : 'Spend',
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#E1306C"
                strokeWidth={2}
                dot={{ fill: '#E1306C', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#833AB4"
                strokeWidth={2}
                dot={{ fill: '#833AB4', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="#F77737"
                strokeWidth={2}
                dot={{ fill: '#F77737', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignComparisonChart({ data }: { data: CampaignComparisonPoint[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Campaign Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => formatINRCompact(v)} />
              <YAxis dataKey="campaign_name" type="category" width={120} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  name === 'spend' ? formatINR(v) : formatNumber(v),
                  name,
                ]}
              />
              <Legend />
              <Bar dataKey="spend" fill="#E1306C" name="Spend" radius={[0, 4, 4, 0]} />
              <Bar dataKey="views" fill="#833AB4" name="Views" radius={[0, 4, 4, 0]} />
              <Bar dataKey="engagement" fill="#F77737" name="Engagement" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TopReelsTable({ reels, onRefetch }: { reels: any[], onRefetch: () => void }) {
  const { isAdmin } = useAuth();
  const { deleteReel } = useManageReels();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<any | null>(null);

  const handleEdit = (reel: any) => {
    setEditingReel(reel);
    setEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reel?')) {
      const success = await deleteReel(id);
      if (success) {
        onRefetch();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Performing Reels</CardTitle>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button onClick={() => { setEditingReel(null); setEditorOpen(true); }} className="bg-[#0064e0] hover:bg-[#0052c2] text-white">
                Create new
              </Button>
            )}
            <ExportButton reels={reels} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead className="w-16">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">CPM</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reels.slice(0, 10).map((reel, index) => (
                <TableRow key={reel.id}>
                  <TableCell className="font-bold text-instagram-pink">{index + 1}</TableCell>
                  <TableCell>
                    <InstagramPreview url={reel.reel_url} size="small" />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{reel.title || 'Untitled'}</TableCell>
                  <TableCell>{formatDate(reel.published_date)}</TableCell>
                  <TableCell className="text-right font-medium">{formatNumber(reel.total_views)}</TableCell>
                  <TableCell className="text-right">{formatNumber(reel.organic_likes)}</TableCell>
                  <TableCell className="text-right">{formatNumber(reel.organic_comments)}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {reel.engagement_rate}%
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatINR(reel.total_promotion_spend)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {reel.cost_per_1k_views > 0 ? formatINR(reel.cost_per_1k_views) : '-'}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(reel)} className="h-8 w-8 text-blue-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(reel.id)} className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {editorOpen && (
        <ReelEditorDialog 
          open={editorOpen} 
          onOpenChange={setEditorOpen} 
          initialData={editingReel} 
          onSaved={onRefetch} 
        />
      )}
    </Card>
  );
}

function GlobalFilters({
  filters,
  onFiltersChange,
  campaigns,
  usernames,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  campaigns: { id: string; name: string }[];
  usernames: string[];
}) {
  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Global Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Date Range</Label>
            <DateRangePicker
              from={filters.date_from}
              to={filters.date_to}
              onChange={(range) => onFiltersChange({ ...filters, date_from: range.from, date_to: range.to })}
            />
          </div>
          <div>
            <Label>Campaign</Label>
            <Select
              value={filters.campaign_ids.join(',')}
              onValueChange={(value) => onFiltersChange({ ...filters, campaign_ids: value ? value.split(',') : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Username</Label>
            <Select
              value={filters.usernames.join(',')}
              onValueChange={(value) => onFiltersChange({ ...filters, usernames: value ? value.split(',') : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All creators" />
              </SelectTrigger>
              <SelectContent>
                {usernames.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Min Engagement Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={filters.min_engagement_rate || ''}
              onChange={(e) => onFiltersChange({ ...filters, min_engagement_rate: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
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

  const handleRefetch = () => {
    refetch();
    refetchReels();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-instagram-pink border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center text-destructive">
          Failed to load dashboard: {error}
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-instagram-pink via-instagram-purple to-instagram-orange bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Instagram Reel Promotion Analytics Overview</p>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Promotion Spend"
            value={formatINR(metrics.total_promotion_spend)}
            icon={DollarSign}
            color="text-instagram-pink"
          />
          <MetricCard
            title="Total Reels"
            value={formatNumber(metrics.total_reels)}
            icon={BarChart3}
            color="text-instagram-purple"
          />
          <MetricCard
            title="Total Views"
            value={formatNumberCompact(metrics.total_views)}
            icon={Eye}
            color="text-instagram-orange"
          />
          <MetricCard
            title="Total Engagement"
            value={formatNumberCompact(metrics.total_engagement)}
            icon={Heart}
            color="text-green-600"
          />
          <MetricCard
            title="Total Likes"
            value={formatNumberCompact(metrics.total_likes)}
            icon={Heart}
            color="text-red-500"
          />
          <MetricCard
            title="Total Comments"
            value={formatNumberCompact(metrics.total_comments)}
            icon={MessageCircle}
            color="text-blue-500"
          />
          <MetricCard
            title="Avg Views/Reel"
            value={formatNumberCompact(metrics.avg_views_per_reel)}
            icon={Target}
            color="text-purple-500"
          />
          <MetricCard
            title="Cost per Post Engagement"
            value={metrics.total_promotion_spend > 0 && metrics.total_engagement > 0 ? formatINR(metrics.total_promotion_spend / metrics.total_engagement) : 'N/A'}
            icon={DollarSign}
            color="text-orange-500"
          />
          <MetricCard
            title="Engagement Rate"
            value={`${metrics.engagement_rate}%`}
            icon={Target}
            color="text-teal-500"
          />
        </div>
      )}

      {highlights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map(card => (
            <HighlightCardComponent key={card.reel_id} card={card} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.spendVsViews.length > 0 && (
          <SpendVsViewsChart data={charts.spendVsViews} />
        )}
        {charts.viewsOverTime.length > 0 && (
          <ViewsOverTimeChart data={charts.viewsOverTime} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.engagementOverTime.length > 0 && (
          <EngagementOverTimeChart data={charts.engagementOverTime} />
        )}
        {charts.campaignComparison.length > 0 && (
          <CampaignComparisonChart data={charts.campaignComparison} />
        )}
      </div>

      {reels.length > 0 && <TopReelsTable reels={reels} onRefetch={handleRefetch} />}
    </div>
  );
}