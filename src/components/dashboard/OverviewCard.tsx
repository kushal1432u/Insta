'use client';

import { OverviewMetric } from '@/types';
import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function OverviewCard({ metric }: { metric: OverviewMetric }) {
  const sparklineData = metric.sparklineData?.map((value, i) => ({ index: i, value })) || [];

  return (
    <div className="bg-white border border-[#DADDE1] rounded-lg p-5 flex flex-col hover:shadow-sm transition-shadow">
      {/* Header: title + info icon */}
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-[13px] font-semibold text-[#1C1E21]">{metric.title}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-[#65676B] hover:text-[#1C1E21] transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="border-[#DADDE1] bg-white text-[#1C1E21] text-xs shadow-lg">
              <p>Information about {metric.title.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main value + change */}
      <div className="flex items-end gap-2.5 mb-4">
        <div className="text-3xl font-bold text-[#1C1E21] tracking-tight leading-none">
          {metric.value}
        </div>
        {metric.change !== undefined && (
          <div
            className={`flex items-center text-xs font-semibold pb-0.5 ${
              metric.changeDirection === 'up'
                ? 'text-[#2DA44E]'
                : metric.changeDirection === 'down'
                ? 'text-[#FA3E3E]'
                : 'text-[#65676B]'
            }`}
          >
            {metric.changeDirection === 'up' && <ArrowUp className="h-3 w-3 mr-0.5" />}
            {metric.changeDirection === 'down' && <ArrowDown className="h-3 w-3 mr-0.5" />}
            {metric.change}%
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="h-10 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0064E0"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sub-metrics */}
      {metric.subMetrics && metric.subMetrics.length > 0 && (
        <div className="space-y-2.5 mt-auto pt-3 border-t border-[#DADDE1]">
          {metric.subMetrics.map((sub, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-[#65676B]">
                {sub.label}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-[#65676B]" />
                    </TooltipTrigger>
                    <TooltipContent className="border-[#DADDE1] bg-white text-[#1C1E21] text-xs shadow-lg">
                      <p>Information about {sub.label.toLowerCase()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1C1E21]">{sub.value}</span>
                {sub.change !== undefined && (
                  <span
                    className={`font-medium flex items-center ${
                      sub.changeDirection === 'up'
                        ? 'text-[#2DA44E]'
                        : sub.changeDirection === 'down'
                        ? 'text-[#FA3E3E]'
                        : 'text-[#65676B]'
                    }`}
                  >
                    {sub.changeDirection === 'up' && <ArrowUp className="h-2.5 w-2.5" />}
                    {sub.changeDirection === 'down' && <ArrowDown className="h-2.5 w-2.5" />}
                    {sub.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
