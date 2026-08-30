'use client';

import { useState, useEffect } from 'react';
import { OverviewMetric } from '@/types';

// Mock data generator for the Instagram-style analytics overview
export function useAnalytics(dateRange: { from: Date; to: Date }) {
  const [metrics, setMetrics] = useState<OverviewMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    // For now, we generate realistic mock data based on the screenshots
    setLoading(true);
    
    setTimeout(() => {
      setMetrics([
        {
          title: 'Views',
          value: '63.8K',
          change: 831,
          changeDirection: 'up',
          sparklineData: [2, 3, 2, 4, 3, 5, 4, 7, 8, 20, 25, 23, 10, 15, 63],
          subMetrics: [
            { label: 'From followers', value: '7.2%', change: 87.4, changeDirection: 'down' },
            { label: 'From non-followers', value: '92.8%', change: 115.9, changeDirection: 'up' },
            { label: 'Viewers', value: '40,265', change: 1.3, changeDirection: 'up' },
          ]
        },
        {
          title: 'Follows',
          value: '2',
          change: 0,
          changeDirection: 'neutral',
          sparklineData: [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
          subMetrics: [
            { label: 'Unfollows', value: '0', change: 100, changeDirection: 'down' },
            { label: 'Net follows', value: '2', change: 300, changeDirection: 'up' },
          ]
        },
        {
          title: 'Visits',
          value: '23',
          change: 81.6,
          changeDirection: 'down',
          sparklineData: [5, 4, 3, 6, 4, 3, 2, 1, 3, 2, 1, 1, 2, 1, 1],
          subMetrics: [
            { label: 'Facebook visits', value: '23', change: 81.6, changeDirection: 'down' },
          ]
        },
        {
          title: 'Interactions',
          value: '118',
          change: 20.3,
          changeDirection: 'down',
          sparklineData: [10, 15, 12, 18, 20, 15, 12, 10, 15, 20, 15, 10, 8, 5, 3],
          subMetrics: [
            { label: 'Content interactions', value: '118', change: 20.3, changeDirection: 'down' },
            { label: 'From followers', value: '39', change: 13.3, changeDirection: 'down' },
            { label: 'From non-followers', value: '79', change: 23.3, changeDirection: 'down' },
          ]
        },
        {
          title: 'Videos and reels',
          value: '1.1T',
          change: 1.3,
          changeDirection: 'down',
          sparklineData: [5, 6, 5, 8, 7, 6, 5, 4, 6, 8, 7, 6, 5, 4, 3],
          subMetrics: [
            { label: '3-second views', value: '1.1T', change: 1.3, changeDirection: 'down' },
            { label: 'Watch time', value: '3h 31m', change: 15.6, changeDirection: 'down' },
          ]
        },
      ]);
      setLoading(false);
    }, 500);
  }, [dateRange]);

  return { metrics, loading };
}
