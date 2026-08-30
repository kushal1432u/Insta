'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudienceDemographic } from '@/types';
import { Info } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AudienceChartProps {
  data: AudienceDemographic[];
}

export function AudienceChart({ data }: AudienceChartProps) {
  return (
    <Card className="rounded-lg shadow-sm border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-1.5">
          Age & gender
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Demographic breakdown of audience</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
              barGap={0}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="ageGroup" 
                axisLine={true}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                ticks={[0, 20, 40]}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '']}
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="square"
                iconSize={12}
                formatter={(value, entry: any) => {
                  const { payload } = entry;
                  // Get total percentage for this gender
                  const total = data.reduce((sum, item) => sum + (item[value as keyof AudienceDemographic] as number), 0);
                  return (
                    <span className="text-gray-600 text-sm ml-1">
                      <span className="font-medium text-gray-900 mr-1">{value === 'women' ? 'Women' : value === 'men' ? 'Men' : 'Non-binary'}</span>
                      <br/>
                      <span className="text-xs">{total.toFixed(1)}%</span>
                    </span>
                  );
                }}
              />
              <Bar dataKey="women" name="women" fill="#93C5FD" radius={[2, 2, 0, 0]} />
              <Bar dataKey="men" name="men" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="nonBinary" name="nonBinary" fill="#6B21A8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
