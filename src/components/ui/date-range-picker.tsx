'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfYear, 
  endOfYear, 
  subWeeks, 
  isSameDay 
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface DateRangePickerProps {
  from?: string | null;
  to?: string | null;
  onChange: (range: { from: string | null; to: string | null }) => void;
  placeholder?: string;
}

// Use the latest date from the user's dataset as the reference date for presets
// so the presets actually return ranges that contain data.
const REFERENCE_DATE = new Date('2026-08-26T12:00:00Z');

const PRESETS = [
  { id: 'yesterday', label: 'Yesterday', getRange: () => ({ from: subDays(REFERENCE_DATE, 1), to: subDays(REFERENCE_DATE, 1) }) },
  { id: 'last_7', label: 'Last 7 days', getRange: () => ({ from: subDays(REFERENCE_DATE, 6), to: REFERENCE_DATE }) },
  { id: 'last_28', label: 'Last 28 days', getRange: () => ({ from: subDays(REFERENCE_DATE, 27), to: REFERENCE_DATE }) },
  { id: 'last_90', label: 'Last 90 days', getRange: () => ({ from: subDays(REFERENCE_DATE, 89), to: REFERENCE_DATE }) },
  { id: 'this_week', label: 'This week', getRange: () => ({ from: startOfWeek(REFERENCE_DATE, { weekStartsOn: 1 }), to: endOfWeek(REFERENCE_DATE, { weekStartsOn: 1 }) }) },
  { id: 'this_month', label: 'This month', getRange: () => ({ from: startOfMonth(REFERENCE_DATE), to: endOfMonth(REFERENCE_DATE) }) },
  { id: 'this_year', label: 'This year', getRange: () => ({ from: startOfYear(REFERENCE_DATE), to: endOfYear(REFERENCE_DATE) }) },
  { id: 'last_week', label: 'Last week', getRange: () => ({ from: startOfWeek(subWeeks(REFERENCE_DATE, 1), { weekStartsOn: 1 }), to: endOfWeek(subWeeks(REFERENCE_DATE, 1), { weekStartsOn: 1 }) }) },
  { id: 'last_month', label: 'Last month', getRange: () => ({ from: startOfMonth(subMonths(REFERENCE_DATE, 1)), to: endOfMonth(subMonths(REFERENCE_DATE, 1)) }) },
  { id: 'custom', label: 'Custom', getRange: () => null }
];

function findActivePreset(from: Date | undefined, to: Date | undefined) {
  if (!from || !to) return 'custom';
  for (const preset of PRESETS) {
    if (preset.id === 'custom') continue;
    const range = preset.getRange();
    if (range && isSameDay(range.from, from) && isSameDay(range.to, to)) {
      return preset.id;
    }
  }
  return 'custom';
}

export function DateRangePicker({ from, to, onChange, placeholder = 'Select date range' }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | undefined>(from ? new Date(from) : undefined);
  const [tempTo, setTempTo] = useState<Date | undefined>(to ? new Date(to) : undefined);
  const [activePresetId, setActivePresetId] = useState<string>(
    findActivePreset(from ? new Date(from) : undefined, to ? new Date(to) : undefined)
  );

  // When opening, reset temp state to actual state
  useEffect(() => {
    if (open) {
      const f = from ? new Date(from) : undefined;
      const t = to ? new Date(to) : undefined;
      setTempFrom(f);
      setTempTo(t);
      setActivePresetId(findActivePreset(f, t));
    }
  }, [open, from, to]);

  const handleApply = () => {
    onChange({
      from: tempFrom ? format(tempFrom, 'yyyy-MM-dd') : null,
      to: tempTo ? format(tempTo, 'yyyy-MM-dd') : null
    });
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handlePresetSelect = (presetId: string) => {
    setActivePresetId(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset && preset.getRange) {
      const range = preset.getRange();
      if (range) {
        setTempFrom(range.from);
        setTempTo(range.to);
      }
    }
  };

  const activePresetLabel = PRESETS.find(p => p.id === activePresetId)?.label || 'Custom';

  let displayLabel = placeholder;
  if (from && to) {
    displayLabel = `${format(new Date(from), 'MMM d, yyyy')} - ${format(new Date(to), 'MMM d, yyyy')}`;
    if (activePresetId !== 'custom') {
      displayLabel = `${activePresetLabel}: ${displayLabel}`;
    }
  } else if (from) {
    displayLabel = format(new Date(from), 'MMM d, yyyy');
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-10 px-3 bg-white hover:bg-gray-50 border-gray-300"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm text-gray-700 truncate">
              {displayLabel}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl shadow-lg border-gray-200" align="start">
        <div className="flex flex-col md:flex-row bg-white rounded-t-xl overflow-hidden">
          
          {/* Sidebar Presets */}
          <div className="w-48 border-r border-gray-100 bg-white py-2 flex-shrink-0 max-h-[350px] overflow-y-auto custom-scrollbar">
            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                onClick={() => handlePresetSelect(preset.id)}
              >
                <div className={`w-4 h-4 rounded-full border flex flex-shrink-0 items-center justify-center ${activePresetId === preset.id ? 'border-blue-600' : 'border-gray-300'}`}>
                  {activePresetId === preset.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <span className="text-sm text-gray-700">{preset.label}</span>
              </div>
            ))}
          </div>

          {/* Calendars */}
          <div className="p-4 bg-white">
            <Calendar
              mode="range"
              selected={{ from: tempFrom, to: tempTo }}
              onSelect={(range) => {
                setTempFrom(range?.from);
                setTempTo(range?.to);
                setActivePresetId('custom');
              }}
              numberOfMonths={2}
              defaultMonth={tempFrom || new Date()}
              className="p-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-200 rounded flex items-center justify-center transition-opacity"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] mb-2",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-colors"
                ),
                day_range_end: "day-range-end",
                day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-[#EBF5FF] aria-selected:text-blue-900 rounded-none",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
              }}
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-xl flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Select value={activePresetId} onValueChange={handlePresetSelect}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input 
                className="w-[130px] h-9 text-sm text-center" 
                value={tempFrom ? format(tempFrom, 'MMM d, yyyy') : ''}
                readOnly
              />
              <span className="text-gray-500">-</span>
              <Input 
                className="w-[130px] h-9 text-sm text-center" 
                value={tempTo ? format(tempTo, 'MMM d, yyyy') : ''}
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <Button variant="outline" size="sm" className="h-9 px-4 text-gray-700" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" className="h-9 px-4 bg-[#0064e0] hover:bg-[#0052c2] text-white" onClick={handleApply}>
              Update
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}