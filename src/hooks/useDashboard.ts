'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DashboardMetrics, ChartDataPoint, CampaignComparisonPoint, HighlightCard, FilterState } from '@/types';
import { calculateEngagementRate, calculateCostPer1kViews, calculateEngagement } from '@/lib/utils';

export function useDashboardMetrics(filters: FilterState = {}) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState({
    spendVsViews: [] as ChartDataPoint[],
    viewsOverTime: [] as ChartDataPoint[],
    engagementOverTime: [] as ChartDataPoint[],
    campaignComparison: [] as CampaignComparisonPoint[],
  });
  const [highlights, setHighlights] = useState<HighlightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const buildFilters = useCallback((baseQuery: any) => {
    let query = baseQuery;

    if (filters.date_from) {
      query = query.gte('published_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('published_date', filters.date_to);
    }
    if (filters.campaign_ids?.length) {
      // Join with campaign_reels for campaign filtering
    }
    if (filters.usernames?.length) {
      query = query.in('username', filters.usernames);
    }

    return query;
  }, [filters]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch reel analytics with optional filters
      let reelQuery = supabase.from('reel_analytics').select('*');
      reelQuery = buildFilters(reelQuery);

      const { data: reels, error: reelsError } = await reelQuery;
      if (reelsError) throw reelsError;

      // Fetch campaign analytics
      let campaignQuery = supabase.from('campaign_analytics').select('*');
      if (filters.campaign_ids?.length) {
        campaignQuery = campaignQuery.in('id', filters.campaign_ids);
      }
      const { data: campaigns, error: campaignsError } = await campaignQuery;
      if (campaignsError) throw campaignsError;

      // Distribute 4.27 Lac budget
      const TOTAL_BUDGET = 427000;
      const totalWeight = reels.reduce((sum, r) => {
        const views = r.total_promotion_views || r.total_views || 0;
        const eng = r.total_promotion_engagement || r.total_engagement || 0;
        return sum + views + (eng * 7.5);
      }, 0);

      reels.forEach(r => {
        const views = r.total_promotion_views || r.total_views || 0;
        const eng = r.total_promotion_engagement || r.total_engagement || 0;
        const weight = views + (eng * 7.5);
        r.total_promotion_spend = totalWeight > 0 ? (weight / totalWeight) * TOTAL_BUDGET : 0;
        r.cost_per_1k_views = views > 0 ? r.total_promotion_spend / (views / 1000) : 0;
      });

      // Calculate aggregate metrics
      const totalPromotionSpend = TOTAL_BUDGET;
      const totalReels = reels.length;
      const totalViews = reels.reduce((sum, r) => sum + r.total_views, 0);
      const totalLikes = reels.reduce((sum, r) => sum + r.organic_likes, 0);
      const totalComments = reels.reduce((sum, r) => sum + r.organic_comments, 0);
      const totalPromotionEngagement = reels.reduce((sum, r) => sum + r.total_promotion_engagement, 0);
      const totalEngagement = totalLikes + totalComments + totalPromotionEngagement;
      const avgViewsPerReel = totalReels > 0 ? Math.round(totalViews / totalReels) : 0;
      const costPer1kViews = calculateCostPer1kViews(totalPromotionSpend, totalViews);
      const engagementRate = totalViews > 0 ? calculateEngagementRate(totalLikes, totalComments + totalPromotionEngagement, totalViews) : 0;

      setMetrics({
        total_promotion_spend: totalPromotionSpend,
        total_reels: totalReels,
        total_views: totalViews,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_engagement: totalEngagement,
        avg_views_per_reel: avgViewsPerReel,
        cost_per_1k_views: costPer1kViews,
        engagement_rate: engagementRate,
      });

      // Build charts data
      // Spend vs Views (scatter data)
      const spendVsViews = reels.map(r => ({
        date: r.published_date,
        views: r.total_views,
        spend: r.total_promotion_spend,
        engagement: r.total_engagement,
      }));

      // Views over time (group by month)
      const viewsByMonth: Record<string, { views: number; engagement: number; spend: number }> = {};
      reels.forEach(r => {
        const month = r.published_date.slice(0, 7); // YYYY-MM
        if (!viewsByMonth[month]) {
          viewsByMonth[month] = { views: 0, engagement: 0, spend: 0 };
        }
        viewsByMonth[month].views += r.total_views;
        viewsByMonth[month].engagement += r.total_engagement;
        viewsByMonth[month].spend += r.total_promotion_spend;
      });

      const viewsOverTime = Object.entries(viewsByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));

      // Engagement over time
      const engagementOverTime = viewsOverTime.map(d => ({
        date: d.date,
        views: d.views,
        engagement: d.engagement,
        spend: d.spend,
      }));

      // Campaign comparison
      const campaignComparison = campaigns.map(c => ({
        campaign_id: c.id,
        campaign_name: c.name,
        spend: c.actual_spend,
        views: c.total_promotion_views,
        engagement: c.total_promotion_engagement,
        cpm: c.total_promotion_views > 0 ? c.actual_spend / (c.total_promotion_views / 1000) : 0,
        cpe: c.total_promotion_engagement > 0 ? c.actual_spend / c.total_promotion_engagement : 0,
      }));

      setCharts({
        spendVsViews,
        viewsOverTime,
        engagementOverTime,
        campaignComparison,
      });

      // Highlights
      if (reels.length > 0) {
        const mostViewed = reels.reduce((max, r) => r.total_views > max.total_views ? r : max, reels[0]);
        const mostLiked = reels.reduce((max, r) => r.organic_likes > max.organic_likes ? r : max, reels[0]);
        const mostCommented = reels.reduce((max, r) => r.organic_comments > max.organic_comments ? r : max, reels[0]);
        const highestEngagement = reels.reduce((max, r) => r.engagement_rate > max.engagement_rate ? r : max, reels[0]);
        const highestSpend = reels.reduce((max, r) => r.total_promotion_spend > max.total_promotion_spend ? r : max, reels[0]);
        const mostCostEfficient = reels
          .filter(r => r.total_promotion_spend > 0 && r.total_views > 0)
          .reduce((min, r) => r.cost_per_1k_views < min.cost_per_1k_views ? r : min, reels[0]);

        setHighlights([
          {
            label: 'Most Viewed Reel',
            value: mostViewed.total_views,
            reel_id: mostViewed.id,
            reel_url: mostViewed.reel_url,
            reel_title: mostViewed.title,
            metric_type: 'views',
          },
          {
            label: 'Most Liked Reel',
            value: mostLiked.organic_likes,
            reel_id: mostLiked.id,
            reel_url: mostLiked.reel_url,
            reel_title: mostLiked.title,
            metric_type: 'likes',
          },
          {
            label: 'Most Commented Reel',
            value: mostCommented.organic_comments,
            reel_id: mostCommented.id,
            reel_url: mostCommented.reel_url,
            reel_title: mostCommented.title,
            metric_type: 'comments',
          },
          {
            label: 'Highest Engagement Rate',
            value: `${highestEngagement.engagement_rate}%`,
            reel_id: highestEngagement.id,
            reel_url: highestEngagement.reel_url,
            reel_title: highestEngagement.title,
            metric_type: 'engagement_rate',
          },
          {
            label: 'Highest Promotion Spend',
            value: highestSpend.total_promotion_spend,
            reel_id: highestSpend.id,
            reel_url: highestSpend.reel_url,
            reel_title: highestSpend.title,
            metric_type: 'spend',
          },
          {
            label: 'Most Cost Efficient (CPM)',
            value: mostCostEfficient.cost_per_1k_views,
            reel_id: mostCostEfficient.id,
            reel_url: mostCostEfficient.reel_url,
            reel_title: mostCostEfficient.title,
            metric_type: 'cost_efficiency',
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [filters, supabase, buildFilters]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    charts,
    highlights,
    loading,
    error,
    refetch: fetchMetrics,
  };
}