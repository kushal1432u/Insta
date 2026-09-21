'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  BarChart3,
  Target,
  ChevronDown,
  Plus,
  Settings,
  HelpCircle,
  Layers,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const NAV_SECTIONS = [
  {
    section: 'Manage',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
      { label: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone, exact: false },
      { label: 'Ad Sets', href: '/dashboard/adsets', icon: Layers, exact: false },
      { label: 'Ads', href: '/dashboard/ads', icon: Target, exact: false },
    ],
  },
  {
    section: 'Measure & Report',
    items: [
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, exact: false },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: Settings, exact: false },
      { label: 'Help', href: 'https://www.facebook.com/business/help', icon: HelpCircle, exact: false, external: true },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    // For /dashboard/ads, don't match /dashboard/ads/[id] as "Ads" active — keep it active for the list
    if (href === '/dashboard/ads') return pathname === '/dashboard/ads' || pathname.startsWith('/dashboard/ads/');
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-white border-r border-[#DADDE1] z-30 flex flex-col overflow-y-auto"
      style={{ width: '220px' }}
    >
      {/* ── Logo + App name ── */}
      <div
        className="flex items-center gap-2.5 px-4 border-b border-[#DADDE1] shrink-0"
        style={{ height: '56px' }}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none">
          <path
            d="M24 12C24 5.37 18.63 0 12 0S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85V15.47H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.96h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.33l-.53 3.47h-2.8v8.38C19.61 22.95 24 17.99 24 12Z"
            fill="#0064E0"
          />
        </svg>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-bold text-[13px] text-[#1C1E21]">Ads Manager</span>
          <span className="text-[11px] text-[#65676B]">Meta for Business</span>
        </div>
      </div>

      {/* ── Account selector ── */}
      <button
        onClick={() => setAccountOpen(!accountOpen)}
        className="flex items-center gap-2 px-3 py-2.5 border-b border-[#DADDE1] hover:bg-[#F0F2F5] transition-colors text-left w-full shrink-0"
      >
        {/* Instagram page avatar — Meta shows the IG profile picture here */}
        <div className="relative shrink-0">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
          >
            PDA
          </div>
          {/* Instagram badge — exactly like Meta shows it */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none">
              <defs>
                <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433"/>
                  <stop offset="25%" stopColor="#e6683c"/>
                  <stop offset="50%" stopColor="#dc2743"/>
                  <stop offset="75%" stopColor="#cc2366"/>
                  <stop offset="100%" stopColor="#bc1888"/>
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#igGrad)"/>
              <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
              <circle cx="17" cy="7" r="1.2" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-[#1C1E21] truncate">
            Puri District Administration
          </span>
          <span className="text-[11px] text-[#65676B] truncate">@puridistrictadmin</span>
        </div>
        <ChevronDown className={cn('h-3.5 w-3.5 text-[#65676B] shrink-0 transition-transform', accountOpen && 'rotate-180')} />
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-2 px-2 space-y-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.section}>
            <p className="px-2 py-1 text-[11px] font-semibold text-[#65676B] uppercase tracking-wider">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact ?? false);
                const Comp = (item as any).external ? 'a' : Link;
                const extraProps = (item as any).external
                  ? { href: item.href, target: '_blank', rel: 'noreferrer' }
                  : { href: item.href };

                return (
                  <Comp
                    key={item.label}
                    {...extraProps}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-100 group w-full',
                      active
                        ? 'bg-[#E7F3FF] text-[#0064E0]'
                        : 'text-[#1C1E21] hover:bg-[#F0F2F5]'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        active ? 'text-[#0064E0]' : 'text-[#65676B] group-hover:text-[#1C1E21]'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0064E0] shrink-0" />
                    )}
                  </Comp>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Create button + sign out ── */}
      <div className="px-3 py-3 border-t border-[#DADDE1] space-y-1.5 shrink-0">
        {isAdmin && (
          <Link href="/dashboard/ads">
            <button className="w-full flex items-center justify-center gap-2 bg-[#0064E0] hover:bg-[#0052C2] text-white text-[13px] font-semibold py-2 rounded-md transition-colors">
              <Plus className="h-4 w-4" />
              Create
            </button>
          </Link>
        )}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#FA3E3E] transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
