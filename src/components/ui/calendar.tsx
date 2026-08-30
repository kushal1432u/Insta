'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CalendarProps = React.ComponentPropsWithoutRef<typeof DayPicker>;

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn(
        'p-3',
        className
      )}
      {...props}
    />
  );
}

export function CalendarWithNavigation({
  className,
  ...props
}: CalendarProps & {
  from?: Date;
  to?: Date;
  onChange?: (date: Date | undefined) => void;
}) {
  const [month, setMonth] = React.useState(new Date());

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMonth(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        numberOfMonths={1}
        className="p-3"
        {...props}
      />
    </div>
  );
}