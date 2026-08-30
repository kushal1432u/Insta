'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Reel, ReelAnalytics, FilterState, PaginatedResponse } from '@/types';

interface UseReelsOptions {
  page?: number;
  pageSize?: number;
  filters?: FilterState;
  campaignId?: string;
}

export function useReels(options: UseReelsOptions = {}) {
  const [reels, setReels] = useState<ReelAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    pageSize: options.pageSize || 20,
    total: 0,
    totalPages: 0,
  });
  const supabase = createClient();

  const buildQuery = useCallback((filters?: FilterState, campaignId?: string) => {
    let query = supabase
      .from('reel_analytics')
      .select('*', { count: 'exact' });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (filters?.date_from) {
      query = query.gte('published_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('published_date', filters.date_to);
    }
    if (filters?.campaign_ids?.length) {
      // This would need a join, simplified for now
    }
    if (filters?.min_views !== null && filters?.min_views !== undefined) {
      query = query.gte('total_views', filters.min_views);
    }
    if (filters?.max_views !== null && filters?.max_views !== undefined) {
      query = query.lte('total_views', filters.max_views);
    }
    if (filters?.min_engagement_rate !== null && filters?.min_engagement_rate !== undefined) {
      query = query.gte('engagement_rate', filters.min_engagement_rate);
    }
    if (filters?.max_engagement_rate !== null && filters?.max_engagement_rate !== undefined) {
      query = query.lte('engagement_rate', filters.max_engagement_rate);
    }
    if (filters?.usernames?.length) {
      query = query.in('username', filters.usernames);
    }

    return query;
  }, [supabase]);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = buildQuery(options.filters, options.campaignId);
      
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      
      query = query.range(from, to).order('published_date', { ascending: false });

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Distribute 4.27 Lac budget for the returned reels
      const { data: allData } = await supabase.from('reel_analytics').select('total_views, total_engagement, total_promotion_views, total_promotion_engagement');
      const TOTAL_BUDGET = 427000;
      let totalWeight = 0;
      if (allData) {
        totalWeight = allData.reduce((sum: number, item: any) => {
          const views = item.total_promotion_views || item.total_views || 0;
          const eng = item.total_promotion_engagement || item.total_engagement || 0;
          return sum + views + (eng * 7.5);
        }, 0);
      }

      const formattedData = (data || []).map((r: any) => {
        const views = r.total_promotion_views || r.total_views || 0;
        const eng = r.total_promotion_engagement || r.total_engagement || 0;
        const weight = views + (eng * 7.5);
        r.total_promotion_spend = totalWeight > 0 ? (weight / totalWeight) * TOTAL_BUDGET : 0;
        r.cost_per_1k_views = views > 0 ? r.total_promotion_spend / (views / 1000) : 0;
        return r;
      });

      setReels(formattedData);
      setPagination(prev => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.pageSize),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reels');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, options.filters, options.campaignId, pagination.page, pagination.pageSize, supabase]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const setPageSize = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  return {
    reels,
    loading,
    error,
    pagination,
    setPage,
    setPageSize,
    refetch: fetchReels,
  };
}

export function useReel(reelId: string) {
  const [reel, setReel] = useState<ReelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!reelId) return;

    const fetchReel = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('reel_analytics')
          .select('*')
          .eq('id', reelId)
          .single();

        if (fetchError) throw fetchError;
        setReel(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reel');
      } finally {
        setLoading(false);
      }
    };

    fetchReel();
  }, [reelId, supabase]);

  return { reel, loading, error };
}

export function useUsernames() {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const { data, error } = await supabase
          .from('reels')
          .select('username')
          .order('username');

        if (error) throw error;
        const uniqueUsernames = [...new Set(data.map(d => d.username))];
        setUsernames(uniqueUsernames);
      } catch (err) {
        console.error('Failed to fetch usernames:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsernames();
  }, [supabase]);

  return { usernames, loading };
}