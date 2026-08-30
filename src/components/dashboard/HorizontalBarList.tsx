'use client';

import { PlacementData, LocationData } from '@/types';

interface HorizontalBarProps {
  title: string;
  data: (PlacementData | LocationData)[];
}

export function HorizontalBarList({ title, data }: HorizontalBarProps) {
  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="flex-1 min-w-0 pr-4">
      <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, i) => {
          const width = Math.max((item.value / maxVal) * 100, 1);
          return (
            <div key={i}>
              <div className="flex justify-between items-end mb-1.5">
                <div className="text-sm text-gray-700 truncate pr-2">{item.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 bg-gray-100 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-teal-700"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-14 text-right">
                  {formatNumber(item.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
