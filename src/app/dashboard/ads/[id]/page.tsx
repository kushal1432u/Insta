'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdDetail } from '@/hooks/useAds';
import { ArrowLeft, Info, Calendar, User, Target, Smartphone, DollarSign, Copy, Pause, MoreHorizontal } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { EngagementBreakdown } from '@/components/dashboard/EngagementBreakdown';
import { AudienceChart } from '@/components/dashboard/AudienceChart';
import { HorizontalBarList } from '@/components/dashboard/HorizontalBarList';
import { InstagramPreview } from '@/components/ui/instagram-preview';

function InfoTooltip({ label }: { label: string }) {
  return (
    <span title={`Information about ${label}`}>
      <Info className="h-3.5 w-3.5 text-[#65676B] cursor-help inline ml-1" />
    </span>
  );
}

function MetaLineChart({ data, dataKey, label, color = '#0064E0' }: { data: any[]; dataKey: string; label: string; color?: string }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DADDE1" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#65676B', fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#65676B', fontSize: 11 }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
          />
          <Tooltip
            contentStyle={{ border: '1px solid #DADDE1', borderRadius: 6, fontSize: 12 }}
            formatter={(v: number) => [v.toLocaleString('en-IN'), label]}
          />
          <Line type="linear" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center mt-3">
        <div className="flex items-center gap-2 text-[12px] text-[#65676B]">
          <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} />
          {label}
        </div>
      </div>
    </div>
  );
}

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { adDetail: ad, loading } = useAdDetail(id);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-[1200px]">
        <div className="h-16 bg-white border border-[#DADDE1] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white border border-[#DADDE1] rounded-lg animate-pulse" />)}
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-white border border-[#DADDE1] rounded-lg animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="bg-white border border-[#DADDE1] rounded-lg p-12 text-center text-[#65676B]">
        Ad not found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1200px]">

      {/* ── Top Header Bar ── */}
      <div className="bg-white border border-[#DADDE1] rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#F0F2F5] text-[#65676B] transition-colors shrink-0 mt-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <InstagramPreview url={ad.reel_url || `https://www.instagram.com/p/${id}`} size="small" className="shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-[#1C1E21] line-clamp-1">{ad.title}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#65676B]">
              <span className="bg-[#F0F2F5] text-[#1C1E21] px-1.5 py-0.5 rounded text-[11px] font-medium">Ad</span>
              <span>·</span>
              <span>Published on: {ad.publishedDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5] transition-colors">
            <Copy className="h-3.5 w-3.5 text-[#65676B]" />
            Duplicate
          </button>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#0064E0] hover:bg-[#0052C2] px-4 py-1.5 rounded-md transition-colors">
            <Pause className="h-3.5 w-3.5" />
            Pause ad
          </button>
          <button className="h-8 w-8 flex items-center justify-center rounded-md border border-[#DADDE1] hover:bg-[#F0F2F5] text-[#65676B] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT: Main charts */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* KPI strip */}
          <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-[#DADDE1]">
              <div className="p-5">
                <div className="text-[12px] font-medium text-[#65676B] mb-1 flex items-center">
                  Post engagements <InfoTooltip label="Post engagements" />
                </div>
                <div className="text-3xl font-bold text-[#1C1E21]">{formatNumber(ad.postEngagements)}</div>
              </div>
              <div className="p-5">
                <div className="text-[12px] font-medium text-[#65676B] mb-1 flex items-center">
                  Cost per Post Engagement <InfoTooltip label="Cost per Post Engagement" />
                </div>
                <div className="text-3xl font-bold text-[#1C1E21]">₹{ad.costPerEngagement.toFixed(2)}</div>
              </div>
              <div className="p-5">
                <div className="text-[12px] font-medium text-[#65676B] mb-1 flex items-center">
                  Views <InfoTooltip label="Views" />
                </div>
                <div className="text-3xl font-bold text-[#1C1E21]">{formatNumber(ad.views)}</div>
              </div>
            </div>
          </div>

          {/* Post Engagements Chart */}
          <div className="bg-white border border-[#DADDE1] rounded-lg p-6">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-[13px] font-semibold text-[#1C1E21]">Post engagements</h3>
              <InfoTooltip label="Post engagements" />
            </div>
            <div className="text-[12px] text-[#65676B] mb-3">Results</div>
            <div className="text-3xl font-bold text-[#1C1E21] mb-5">{formatNumber(ad.postEngagements)}</div>
            <MetaLineChart data={ad.engagementTimeline} dataKey="value" label="Post engagements" color="#0064E0" />
          </div>

          {/* Views Chart */}
          <div className="bg-white border border-[#DADDE1] rounded-lg p-6">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-[13px] font-semibold text-[#1C1E21]">Views</h3>
              <InfoTooltip label="Views" />
            </div>
            <div className="text-3xl font-bold text-[#1C1E21] mb-5">{formatNumber(ad.views)}</div>
            <MetaLineChart data={ad.viewsTimeline} dataKey="value" label="Views" color="#0064E0" />
          </div>

          {/* Viewers */}
          <div className="bg-white border border-[#DADDE1] rounded-lg p-6">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-[13px] font-semibold text-[#1C1E21]">Viewers</h3>
              <InfoTooltip label="Viewers" />
            </div>
            <div className="text-3xl font-bold text-[#1C1E21]">{formatNumber(ad.viewers)}</div>
          </div>

          {/* Engagement Breakdown */}
          <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
            <EngagementBreakdown data={ad.engagementBreakdown} totalEngagements={ad.postEngagements} />
          </div>

          {/* Clicks + FB Likes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#DADDE1] rounded-lg p-6">
              <h3 className="text-[13px] font-semibold text-[#1C1E21] mb-4">Clicks</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[12px] text-[#65676B] mb-1 flex items-center">Link clicks <InfoTooltip label="Link clicks" /></div>
                  <div className="text-2xl font-bold text-[#1C1E21]">{formatNumber(ad.clicks.linkClicks)}</div>
                </div>
                <div>
                  <div className="text-[12px] text-[#65676B] mb-1 flex items-center">CTR <InfoTooltip label="CTR" /></div>
                  <div className="text-2xl font-bold text-[#1C1E21]">{ad.clicks.ctr.toFixed(2)}%</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#DADDE1] rounded-lg p-6">
              <div className="text-[12px] text-[#65676B] mb-1 flex items-center">Facebook likes <InfoTooltip label="Facebook likes" /></div>
              <div className="text-3xl font-bold text-[#1C1E21]">{formatNumber(ad.facebookLikes)}</div>
            </div>
          </div>

          {/* Video Metrics */}
          <div className="bg-white border border-[#DADDE1] rounded-lg p-6">
            <h3 className="text-[13px] font-semibold text-[#1C1E21] mb-4">Video</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Video plays', value: `${(ad.video.videoPlays / 1000).toFixed(1)}K` },
                { label: 'ThruPlays', value: `${(ad.video.thruPlays / 1000).toFixed(1)}K` },
                { label: 'Avg play time', value: ad.video.avgPlayTime },
                { label: '3-sec plays', value: `${(ad.video.threeSecPlays / 1000).toFixed(1)}K` },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[12px] text-[#65676B] mb-1 flex items-center">{m.label} <InfoTooltip label={m.label} /></div>
                  <div className="text-xl font-bold text-[#1C1E21]">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience + Placements + Locations */}
          <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DADDE1]">
              <h3 className="text-[13px] font-semibold text-[#1C1E21]">Audience</h3>
            </div>
            <div className="p-6 border-b border-[#DADDE1]">
              <AudienceChart data={ad.audience} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#DADDE1]">
              <div className="p-6"><HorizontalBarList title="Placements" data={ad.placements} /></div>
              <div className="p-6"><HorizontalBarList title="Locations" data={ad.locations} /></div>
            </div>
          </div>

        </div>

        {/* RIGHT: Details sidebar */}
        <div className="flex flex-col gap-4">

          {/* Ad details */}
          <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DADDE1]">
              <h3 className="text-[13px] font-semibold text-[#1C1E21]">Ad details</h3>
              <span className="text-[11px] font-semibold text-[#2DA44E] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                {ad.status} · Finishes {ad.finishesIn}
              </span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { icon: Target, label: 'Goal', value: ad.goal },
                { icon: Smartphone, label: 'Platforms', value: ad.platforms },
                { icon: DollarSign, label: 'Amount spent', value: `${formatINR(ad.amountSpent)} over 6 days` },
                { icon: DollarSign, label: 'Daily budget', value: formatINR(ad.dailyBudget) },
                { icon: Calendar, label: 'Start date', value: ad.startDate },
                { icon: Calendar, label: 'End date', value: ad.endDate },
                { icon: User, label: 'Created by', value: ad.createdBy },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="h-4 w-4 text-[#65676B] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[12px] font-semibold text-[#1C1E21]">{label}</div>
                    <div className="text-[12px] text-[#65676B] mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad preview */}
          <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#DADDE1]">
              <h3 className="text-[13px] font-semibold text-[#1C1E21]">Ad preview</h3>
            </div>
            <div className="p-4">
              <InstagramPreview url={ad.reel_url || `https://www.instagram.com/p/${id}`} size="large" />
            </div>
          </div>

          {/* Duplicate ad card */}
          <div className="bg-white border border-[#DADDE1] rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-[#1C1E21] mb-2">Duplicate this ad</h3>
            <p className="text-[12px] text-[#65676B] mb-3">Create a copy of this ad to run with different targeting or budget.</p>
            <button className="w-full flex items-center justify-center gap-2 text-[13px] font-medium text-[#0064E0] border border-[#0064E0] py-2 rounded-md hover:bg-[#E7F3FF] transition-colors">
              <Copy className="h-3.5 w-3.5" />
              Duplicate ad
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
