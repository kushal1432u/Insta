'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  HelpCircle,
  RefreshCw,
  Grid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname.startsWith('/dashboard/campaigns')) return 'Campaigns';
    if (pathname.startsWith('/dashboard/adsets')) return 'Ad Sets';
    if (pathname.startsWith('/dashboard/ads/') && pathname.length > '/dashboard/ads/'.length)
      return 'Ad Details';
    if (pathname.startsWith('/dashboard/ads')) return 'Ads';
    if (pathname.startsWith('/dashboard/analytics')) return 'Analytics';
    if (pathname.startsWith('/dashboard/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header
      className="fixed top-0 right-0 bg-white border-b border-[#DADDE1] z-40 flex items-center justify-between px-4 gap-3"
      style={{ height: '56px', left: '220px' }}
    >
      {/* Left: Meta logo mark + Breadcrumb */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Small Meta logo mark in header */}
        <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-[#DADDE1] mr-1">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M24 12C24 5.37 18.63 0 12 0S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85V15.47H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.96h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.33l-.53 3.47h-2.8v8.38C19.61 22.95 24 17.99 24 12Z"
              fill="#0064E0"
            />
          </svg>
          <span className="text-[13px] font-bold text-[#1C1E21]">Ads Manager</span>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#65676B] hover:text-[#0064E0] transition-colors text-[13px] hidden sm:block"
          >
            Ads Manager
          </button>
          <span className="text-[#DADDE1] hidden sm:block">›</span>
          <span className="font-semibold text-[#1C1E21] text-[13px] truncate max-w-[160px]">
            {getBreadcrumb()}
          </span>
        </nav>
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65676B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns, ad sets, ads…"
            className="w-full bg-[#F0F2F5] border border-transparent rounded-full text-[13px] pl-9 pr-4 py-1.5 text-[#1C1E21] placeholder:text-[#65676B] focus:outline-none focus:border-[#0064E0] focus:bg-white transition-all duration-150"
          />
        </div>
      </div>

      {/* Right: Action icons */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Refresh */}
        <button
          onClick={() => window.location.reload()}
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#F0F2F5] text-[#65676B] transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-[17px] w-[17px]" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#F0F2F5] text-[#65676B] transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FA3E3E] border border-white" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-[#DADDE1] rounded-lg shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#DADDE1]">
                <span className="font-semibold text-[13px] text-[#1C1E21]">Notifications</span>
                <button className="text-[12px] text-[#0064E0] font-medium hover:underline">
                  Mark all as read
                </button>
              </div>
              <div className="py-3 px-4 text-center text-[13px] text-[#65676B]">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#F0F2F5] text-[#65676B] transition-colors"
          title="Help"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        {/* Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 ml-1 px-2 py-1 rounded-md hover:bg-[#F0F2F5] transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0064E0] text-white text-xs font-bold shrink-0">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#65676B]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 border-[#DADDE1] shadow-xl rounded-lg" align="end" forceMount>
            <DropdownMenuLabel className="font-normal py-3 px-4">
              <div className="flex items-center gap-3">
                {/* Instagram gradient avatar */}
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 relative"
                  style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                >
                  PDA
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                      <defs>
                        <linearGradient id="igGradHdr" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f09433"/>
                          <stop offset="50%" stopColor="#dc2743"/>
                          <stop offset="100%" stopColor="#bc1888"/>
                        </linearGradient>
                      </defs>
                      <rect width="24" height="24" rx="6" fill="url(#igGradHdr)"/>
                      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none"/>
                      <circle cx="17" cy="7" r="1.3" fill="white"/>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[13px] font-bold text-[#1C1E21] truncate">Puri District Administration</p>
                  <p className="text-[11px] text-[#65676B] truncate">@puridistrictadmin</p>
                  <p className="text-[11px] text-[#65676B] truncate mt-0.5">{user?.email}</p>
                  <span className={cn(
                    'mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded w-fit',
                    user?.role === 'admin'
                      ? 'bg-[#0064E0] text-white'
                      : 'bg-[#F0F2F5] text-[#65676B]'
                  )}>
                    {user?.role === 'admin' ? 'ADMIN' : 'USER'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#DADDE1]" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1C1E21] cursor-pointer">
                <Settings className="h-4 w-4 text-[#65676B]" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#DADDE1]" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#FA3E3E] cursor-pointer focus:text-[#FA3E3E] focus:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}