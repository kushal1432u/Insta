'use client';

import { Card, CardContent } from '@/components/ui/card';
import { OverviewMetric } from '@/types';
import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function OverviewCard({ metric }: { metric: OverviewMetric }) {
  const sparklineData = metric.sparklineData?.map((value, i) => ({ index: i, value })) || [];

  return (
    <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200 h-full flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-lg">
            {metric.title}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Information about {metric.title.toLowerCase()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex items-end gap-3 mb-6">
          <div className="text-4xl font-semibold tracking-tight">{metric.value}</div>
          {metric.change !== undefined && (
            <div className={`flex items-center text-sm font-medium pb-1 ${
              metric.changeDirection === 'up' ? 'text-green-600' :
              metric.changeDirection === 'down' ? 'text-red-500' :
              'text-gray-500'
            }`}>
              {metric.changeDirection === 'up' && <ArrowUp className="h-3 w-3 mr-0.5" />}
              {metric.changeDirection === 'down' && <ArrowDown className="h-3 w-3 mr-0.5" />}
              {metric.change}%
            </div>
          )}
        </div>

        {sparklineData.length > 0 && (
          <div className="h-10 w-full mb-6 relative">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#7dd3fc" 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-3 mt-auto pt-2 border-t border-gray-50">
          {metric.subMetrics?.map((sub, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                {sub.label}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Information about {sub.label.toLowerCase()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{sub.value}</span>
                {sub.change !== undefined && (
                  <span className={`text-xs font-medium flex items-center ${
                    sub.changeDirection === 'up' ? 'text-green-600' :
                    sub.changeDirection === 'down' ? 'text-red-500' :
                    'text-gray-500'
                  }`}>
                    {sub.changeDirection === 'up' && <ArrowUp className="h-3 w-3" />}
                    {sub.changeDirection === 'down' && <ArrowDown className="h-3 w-3" />}
                    {sub.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
