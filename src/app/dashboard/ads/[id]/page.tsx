'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdDetail } from '@/hooks/useAds';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Settings, Calendar, User, Target, Smartphone, DollarSign, AlertTriangle } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { EngagementBreakdown } from '@/components/dashboard/EngagementBreakdown';
import { AudienceChart } from '@/components/dashboard/AudienceChart';
import { HorizontalBarList } from '@/components/dashboard/HorizontalBarList';
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip as UITooltip } from '@/components/ui/tooltip';
import { InstagramPreview } from '@/components/ui/instagram-preview';

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { adDetail: ad, loading } = useAdDetail(id);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!ad) {
    return <div className="p-8 text-center">Ad not found</div>;
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-20 bg-gray-50 min-h-screen -mt-6 pt-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-start gap-3">
            <InstagramPreview url={ad.reel_url || `https://www.instagram.com/p/${id}`} size="small" className="mt-1" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{ad.title}</h1>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs">Ad</span>
                <span>•</span>
                <span>Published on: {ad.publishedDate}</span>
              </div>
            </div>
          </div>
        </div>
        <Button className="bg-[#0064e0] hover:bg-[#0052c2] text-white self-start md:self-auto">
          Pause ad
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview KPI Cards */}
          <Card className="rounded-lg shadow-sm border-gray-200">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="p-5">
                  <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Post engagements <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="text-3xl font-semibold">{formatNumber(ad.postEngagements)}</div>
                </div>
                <div className="p-5">
                  <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Cost per Post Engagement <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="text-3xl font-semibold">₹{ad.costPerEngagement.toFixed(2)}</div>
                </div>
                <div className="p-5">
                  <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Views <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="text-3xl font-semibold">{formatNumber(ad.views)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Engagements Timeline */}
          <Card className="rounded-lg shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-medium text-gray-900">Post engagements</h3>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="text-sm text-gray-500 mb-4">Results</div>
              <div className="text-3xl font-semibold mb-6">{formatNumber(ad.postEngagements)}</div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ad.engagementTimeline} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 12}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 12}}
                      tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}T` : value}
                    />
                    <Tooltip />
                    <Line type="linear" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-0.5 bg-[#38bdf8]"></div>
                  Post engagements
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Views Timeline */}
          <Card className="rounded-lg shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-medium text-gray-900">Views</h3>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="text-3xl font-semibold mb-6">{formatNumber(ad.views)}</div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ad.viewsTimeline} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 12}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 12}}
                      tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}T` : value}
                    />
                    <Tooltip />
                    <Line type="linear" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-0.5 bg-[#38bdf8]"></div>
                  Views
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Viewers */}
          <Card className="rounded-lg shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-medium text-gray-900">Viewers</h3>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="text-3xl font-semibold">{formatNumber(ad.viewers)}</div>
            </CardContent>
          </Card>

          {/* Engagement Breakdown */}
          <EngagementBreakdown data={ad.engagementBreakdown} totalEngagements={ad.postEngagements} />

          {/* Clicks & FB Likes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="rounded-lg shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Clicks</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      Link clicks <Info className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div className="text-2xl font-semibold">{formatNumber(ad.clicks.linkClicks)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      CTR (link click-through rate) <Info className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div className="text-2xl font-semibold">{ad.clicks.ctr.toFixed(2)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm border-gray-200">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  Facebook likes <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-3xl font-semibold">{formatNumber(ad.facebookLikes)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Video Metrics */}
          <Card className="rounded-lg shadow-sm border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Video</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Video plays <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-semibold">{(ad.video.videoPlays/1000).toFixed(1)}T</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    ThruPlays <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-semibold">{(ad.video.thruPlays/1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Video average play time <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-semibold">{ad.video.avgPlayTime}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    3-second video plays <Info className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-semibold">{(ad.video.threeSecPlays/1000).toFixed(1)}K</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audience, Placements, Locations */}
          <Card className="rounded-lg shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">Audience</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-100">
                <AudienceChart data={ad.audience} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="p-6">
                  <HorizontalBarList title="Placements" data={ad.placements} />
                </div>
                <div className="p-6">
                  <HorizontalBarList title="Locations" data={ad.locations} />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* Ad details panel */}
          <Card className="rounded-lg shadow-sm border-gray-200">
            <CardHeader className="pb-3 flex flex-row justify-between items-center">
              <CardTitle className="text-base font-semibold">Ad details</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-none font-normal">
                {ad.status} • Finishes in {ad.finishesIn}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Goal</div>
                  <div className="text-sm text-gray-500">{ad.goal}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Smartphone className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Platforms</div>
                  <div className="text-sm text-gray-500">{ad.platforms}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Amount spent</div>
                  <div className="text-sm text-gray-500">{formatINR(ad.amountSpent)} spent over 6 days</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Daily budget</div>
                  <div className="text-sm text-gray-500">{formatINR(ad.dailyBudget)}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Start date</div>
                  <div className="text-sm text-gray-500">{ad.startDate}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">End date</div>
                  <div className="text-sm text-gray-500">{ad.endDate}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <User className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Created by</div>
                  <div className="text-sm text-gray-500">{ad.createdBy}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ad preview panel */}
          <Card className="rounded-lg shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Ad preview</CardTitle>
            </CardHeader>
            <CardContent>
              <InstagramPreview url={ad.reel_url || `https://www.instagram.com/p/${id}`} size="large" />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
