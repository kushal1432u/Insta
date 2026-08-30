'use client';

import { useParams } from 'next/navigation';
import { useReel } from '@/hooks/useReels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatINR, formatNumber, formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Eye, Heart, MessageCircle, DollarSign, Target, Clock, Calendar, Hash, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ReelDetailPage() {
  const params = useParams();
  const reelId = params.id as string;
  const { reel, loading, error } = useReel(reelId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-instagram-pink border-t-transparent" />
      </div>
    );
  }

  if (error || !reel) {
    return (
      <Card className="border-destructive max-w-2xl mx-auto mt-8">
        <CardContent className="p-6 text-center text-destructive">
          <p>Reel not found</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-instagram-pink via-instagram-purple to-instagram-orange bg-clip-text text-transparent">
            Reel Details
          </h1>
          <p className="text-muted-foreground">Complete analytics and promotion data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{reel.title || 'Untitled Reel'}</CardTitle>
                <p className="text-muted-foreground">@{reel.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={reel.reel_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Instagram
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(reel.reel_url)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy URL
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {reel.full_caption && (
              <div>
                <h3 className="font-medium mb-2">Full Caption</h3>
                <p className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{reel.full_caption}</p>
              </div>
            )}

            {reel.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{reel.description}</p>
              </div>
            )}

            {reel.hashtags && reel.hashtags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {reel.hashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      <Hash className="h-3 w-3" />#{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <h3 className="font-medium">Organic Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricIcon value={formatNumber(reel.organic_views)} label="Views" icon={Eye} color="text-instagram-pink" />
              <MetricIcon value={formatNumber(reel.organic_likes)} label="Likes" icon={Heart} color="text-red-500" />
              <MetricIcon value={formatNumber(reel.organic_comments)} label="Comments" icon={MessageCircle} color="text-blue-500" />
              <MetricIcon value={`${reel.engagement_rate}%`} label="Engagement Rate" icon={Target} color="text-green-600" />
            </div>

            {reel.total_promotion_spend > 0 && (
              <>
                <Separator />
                <h3 className="font-medium">Promotion Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricIcon value={formatINR(reel.total_promotion_spend)} label="Promotion Spend" icon={DollarSign} color="text-instagram-orange" />
                  <MetricIcon value={formatNumber(reel.total_promotion_views)} label="Promotion Views" icon={Eye} color="text-instagram-purple" />
                  <MetricIcon value={formatNumber(reel.total_promotion_engagement)} label="Promotion Engagement" icon={Target} color="text-teal-500" />
                  <MetricIcon value={reel.cost_per_1k_views > 0 ? formatINR(reel.cost_per_1k_views) : 'N/A'} label="Cost per 1K Views" icon={DollarSign} color="text-orange-500" />
                </div>
              </>
            )}

            <Separator />

            <h3 className="font-medium">Reel Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Reel URL" value={<a href={reel.reel_url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{reel.reel_url}</a>} />
              <InfoRow label="Published Date" value={formatDate(reel.published_date)} icon={Calendar} />
              <InfoRow label="Duration" value={reel.duration_seconds ? `${reel.duration_seconds}s` : 'N/A'} icon={Clock} />
              <InfoRow label="Fetched At" value={formatDateTime(reel.fetched_at)} icon={Calendar} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-instagram-pink/10 via-instagram-purple/10 to-instagram-orange/10 rounded-lg">
                <div className="text-3xl font-bold bg-gradient-to-r from-instagram-pink via-instagram-purple to-instagram-orange bg-clip-text text-transparent">
                  {formatNumber(reel.total_views)}
                </div>
                <div className="text-sm text-muted-foreground">Total Views (Organic + Paid)</div>
              </div>

              <div className="space-y-3">
                <StatRow label="Total Engagement" value={formatNumber(reel.total_engagement)} icon={Heart} />
                <StatRow label="Engagement Rate" value={`${reel.engagement_rate}%`} icon={Target} color="text-green-600" />
                <StatRow label="Promotion Spend" value={formatINR(reel.total_promotion_spend)} icon={DollarSign} color="text-instagram-orange" />
                <StatRow label="Cost per 1K Views" value={reel.cost_per_1k_views > 0 ? formatINR(reel.cost_per_1k_views) : 'N/A'} icon={DollarSign} color="text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {reel.total_promotion_spend > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Campaign Allocations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Campaign allocations would be displayed here */}
                  <p className="text-sm text-muted-foreground">This reel is part of campaign promotions</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={reel.reel_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Instagram
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigator.clipboard.writeText(reel.reel_url)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Reel URL
              </Button>
              {reel.full_caption && (
                <Button variant="outline" className="w-full justify-start" onClick={() => navigator.clipboard.writeText(reel.full_caption!)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Caption
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricIcon({ value, label, icon: Icon, color }: { value: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-5 w-5', color)} />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatRow({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', color || 'text-muted-foreground')} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}