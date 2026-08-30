'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EngagementBreakdownProps {
  data: {
    threeSecViews: number;
    postReactions: number;
    postShares: number;
    postSaves: number;
    linkClicks: number;
  };
  totalEngagements: number;
}

export function EngagementBreakdown({ data, totalEngagements }: EngagementBreakdownProps) {
  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  
  // Calculate max to determine bar width relative to the largest value
  const maxVal = Math.max(
    data.threeSecViews,
    data.postReactions,
    data.postShares,
    data.postSaves,
    data.linkClicks
  );

  const items = [
    { label: '3-second views', value: data.threeSecViews, color: 'bg-teal-700' },
    { label: 'Post reactions', value: data.postReactions, color: 'bg-teal-700' },
    { label: 'Post shares', value: data.postShares, color: 'bg-teal-700' },
    { label: 'Post saves', value: data.postSaves, color: 'bg-teal-700' },
    { label: 'Link clicks', value: data.linkClicks, color: 'bg-teal-700' },
  ];

  return (
    <Card className="rounded-lg shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-1.5">
          Post engagements
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Breakdown of post engagements</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="text-4xl font-semibold mt-2">{formatNumber(totalEngagements)}</div>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((item, i) => {
          // ensure minimum width for visibility if value > 0
          let width = item.value > 0 ? Math.max((item.value / maxVal) * 100, 1) : 0;
          return (
            <div key={i}>
              <div className="text-sm text-gray-600 mb-1.5">{item.label}</div>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 bg-gray-100 rounded-sm overflow-hidden">
                  <div 
                    className={`h-full ${item.color}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="text-sm font-medium w-12 text-right">
                  {formatNumber(item.value)}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
