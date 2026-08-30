'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdCampaignRow, AdDetail } from '@/types';
import { format, addDays } from 'date-fns';

export function useAds() {
  const [ads, setAds] = useState<AdCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAds() {
      try {
        const { data, error } = await supabase
          .from('reel_analytics')
          .select('*')
          .order('published_date', { ascending: false });

        if (error) throw error;

        if (data) {
          const TOTAL_BUDGET = 427000;
          const totalWeight = data.reduce((sum: number, item: any) => {
            const views = item.total_promotion_views || item.total_views || 0;
            const engagement = item.total_promotion_engagement || item.total_engagement || 0;
            return sum + views + (engagement * 7.5);
          }, 0);

          const formattedAds: AdCampaignRow[] = data.map((item: any) => {
            const views = item.total_promotion_views || item.total_views || 0;
            const engagement = item.total_promotion_engagement || item.total_engagement || 0;
            const weight = views + (engagement * 7.5);
            const calculatedSpend = totalWeight > 0 ? (weight / totalWeight) * TOTAL_BUDGET : 0;

            return {
              id: item.id,
              title: item.title || `Instagram reel by ${item.username}`,
              status: calculatedSpend > 0 ? 'Active' : 'Completed',
              results: engagement,
              resultType: 'Post engagements',
              costPerResult: calculatedSpend / Math.max(engagement, 1),
              amountSpent: calculatedSpend,
              views: views,
              viewers: Math.floor(views * 0.7),
              startDate: item.published_date,
              endDate: item.fetched_at || item.published_date,
              createdBy: 'Admin',
              reel_url: item.reel_url
            };
          });
          setAds(formattedAds);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAds();
  }, [supabase]);

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reel_analytics')
      .select('*')
      .order('published_date', { ascending: false });
    
    if (data) {
      const TOTAL_BUDGET = 427000;
      const totalWeight = data.reduce((sum: number, item: any) => {
        const views = item.total_promotion_views || item.total_views || 0;
        const engagement = item.total_promotion_engagement || item.total_engagement || 0;
        return sum + views + (engagement * 7.5);
      }, 0);

      const formattedAds = data.map((item: any) => {
        const views = item.total_promotion_views || item.total_views || 0;
        const engagement = item.total_promotion_engagement || item.total_engagement || 0;
        const weight = views + (engagement * 7.5);
        const calculatedSpend = totalWeight > 0 ? (weight / totalWeight) * TOTAL_BUDGET : 0;

        return {
          id: item.id,
          title: item.title || `Instagram reel by ${item.username}`,
          status: calculatedSpend > 0 ? 'Active' : 'Completed',
          results: engagement,
          resultType: 'Post engagements',
          costPerResult: calculatedSpend / Math.max(engagement, 1),
          amountSpent: calculatedSpend,
          views: views,
          viewers: Math.floor(views * 0.7),
          startDate: item.published_date,
          endDate: item.fetched_at || item.published_date,
          createdBy: 'Admin',
          reel_url: item.reel_url
        };
      });
      setAds(formattedAds);
    }
    setLoading(false);
  };

  return { ads, loading, refetch };
}

// Helper to generate deterministic pseudo-random numbers based on a string seed
function seededRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0 / 4294967296;
  };
}

export function useAdDetail(reelId: string) {
  const [adDetail, setAdDetail] = useState<AdDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAdDetail() {
      try {
        const { data, error } = await supabase
          .from('reel_analytics')
          .select('*')
          .eq('id', reelId)
          .single();

        if (error) throw error;

        if (data) {
          // Calculate realistic spend by fetching totals to distribute 4,27,000 budget
          const { data: allData } = await supabase.from('reel_analytics').select('total_views, total_engagement, total_promotion_views, total_promotion_engagement');
          const TOTAL_BUDGET = 427000;
          let calculatedSpend = 0;
          
          if (allData) {
            const totalWeight = allData.reduce((sum: number, item: any) => {
              const views = item.total_promotion_views || item.total_views || 0;
              const eng = item.total_promotion_engagement || item.total_engagement || 0;
              return sum + views + (eng * 7.5);
            }, 0);
            
            const itemViews = data.total_promotion_views || data.total_views || 0;
            const itemEng = data.total_promotion_engagement || data.total_engagement || 0;
            const itemWeight = itemViews + (itemEng * 7.5);
            
            calculatedSpend = totalWeight > 0 ? (itemWeight / totalWeight) * TOTAL_BUDGET : 0;
          }

          const rand = seededRandom(reelId);
          
          const spend = calculatedSpend;
          const views = data.total_promotion_views || data.total_views || 0;
          const engagement = data.total_promotion_engagement || data.total_engagement || 0;
          const clicks = data.total_promotion_clicks || Math.floor(views * 0.02);
          const viewers = Math.floor(views * 0.7);
          
          const startDate = new Date(data.published_date);
          const endDate = new Date(data.fetched_at || new Date().toISOString());
          const daysDiff = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
          
          // Generate timelines
          const engagementTimeline = [];
          const viewsTimeline = [];
          
          let remainingEngagement = engagement;
          let remainingViews = views;
          
          for (let i = 0; i < Math.min(daysDiff, 14); i++) { // Show max 14 days on timeline
            const currentDate = addDays(startDate, i);
            const dateStr = format(currentDate, 'MMM d');
            
            const isLast = i === Math.min(daysDiff, 14) - 1;
            
            const dayEngagement = isLast ? remainingEngagement : Math.floor(engagement * (0.05 + (rand() * 0.1)));
            const dayViews = isLast ? remainingViews : Math.floor(views * (0.05 + (rand() * 0.1)));
            
            engagementTimeline.push({ date: dateStr, value: dayEngagement });
            viewsTimeline.push({ date: dateStr, value: dayViews });
            
            remainingEngagement -= dayEngagement;
            remainingViews -= dayViews;
          }

          // Generate engagement breakdown
          const threeSecViews = Math.floor(views * 0.15); // usually 15% of views
          const postReactions = Math.floor(engagement * 0.85);
          const postShares = Math.floor(engagement * 0.10);
          const postSaves = Math.floor(engagement * 0.04);
          const linkClicks = clicks;

          // Generate Audience Demographics
          const totalBase = 100;
          const audience = [
            { ageGroup: '18-24', women: 13.5 + (rand() * 5), men: 44.7 + (rand() * 5), nonBinary: 0.2 },
            { ageGroup: '25-34', women: 3.6 + (rand() * 2), men: 22.8 + (rand() * 5), nonBinary: 0 },
            { ageGroup: '35-44', women: 1.5 + (rand() * 1), men: 6.8 + (rand() * 2), nonBinary: 0 },
            { ageGroup: '45-54', women: 1.0, men: 3.1 + (rand() * 1), nonBinary: 0 },
            { ageGroup: '55-64', women: 0.4, men: 1.3, nonBinary: 0 },
            { ageGroup: '65+', women: 0.3, men: 1.0, nonBinary: 0 }
          ];

          setAdDetail({
            id: data.id,
            reel_url: data.reel_url,
            title: data.title || `Instagram post by ${data.username}`,
            publishedDate: format(new Date(data.published_date), 'EEE MMM d, h:mma'),
            type: 'Ad',
            status: spend > 0 ? 'Active' : 'Completed',
            finishesIn: spend > 0 ? 'Active' : 'Finished',
            goal: 'Get more post engagement',
            platforms: 'Instagram',
            amountSpent: spend,
            dailyBudget: spend / daysDiff,
            startDate: format(startDate, 'MMM d, yyyy'),
            endDate: format(endDate, 'MMM d, yyyy'),
            createdBy: 'Admin',
            postEngagements: engagement,
            costPerEngagement: spend / Math.max(engagement, 1),
            views: views,
            viewers: viewers,
            engagementTimeline,
            viewsTimeline,
            engagementBreakdown: {
              threeSecViews,
              postReactions,
              postShares,
              postSaves,
              linkClicks
            },
            clicks: {
              linkClicks: linkClicks,
              ctr: Number(((linkClicks / Math.max(views, 1)) * 100).toFixed(2))
            },
            facebookLikes: 0,
            video: {
              videoPlays: Math.floor(views * 0.95),
              thruPlays: Math.floor(views * 0.05),
              avgPlayTime: '2s',
              threeSecPlays: threeSecViews
            },
            audience,
            placements: [
              { name: 'Instagram Reels on mobile devices', value: Math.floor(views * 0.65), color: '#008080' },
              { name: 'Instagram Feed on mobile devices', value: Math.floor(views * 0.30), color: '#008080' },
              { name: 'Instagram Stories on mobile devices', value: Math.floor(views * 0.04), color: '#008080' },
              { name: 'Explore home', value: Math.floor(views * 0.01), color: '#008080' }
            ],
            locations: [
              { name: 'Odisha', value: Math.floor(views * 0.75), color: '#008080' },
              { name: 'West Bengal', value: Math.floor(views * 0.15), color: '#008080' },
              { name: 'Andhra Pradesh', value: Math.floor(views * 0.10), color: '#008080' }
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching ad detail:', err);
      } finally {
        setLoading(false);
      }
    }

    if (reelId) {
      fetchAdDetail();
    }
  }, [reelId, supabase]);

  return { adDetail, loading };
}
