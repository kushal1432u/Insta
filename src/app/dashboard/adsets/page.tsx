'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAds } from '@/hooks/useAds';
import { formatINR, formatNumber } from '@/lib/utils';
import {
  Plus, Search, SlidersHorizontal, Columns, Download,
  ChevronLeft, ChevronRight, ArrowUpDown, Edit, Trash2,
  MoreHorizontal, Pause,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function StatusDot({ status }: { status: string }) {
  const isActive = status === 'Active';
  const isPaused = status === 'Paused';
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${isActive ? 'bg-[#2DA44E]' : isPaused ? 'bg-[#F5A623]' : 'bg-[#65676B]'}`} />
      <span className="text-[13px] text-[#1C1E21]">{status}</span>
    </div>
  );
}

const PAGE_SIZE = 15;

export default function AdSetsPage() {
  const { ads, loading } = useAds();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Model ads as ad sets (each ad belongs to its own ad set in this data model)
  const adSets = ads.map((ad, i) => ({
    id: ad.id,
    name: `Ad Set — ${ad.title.slice(0, 40)}${ad.title.length > 40 ? '…' : ''}`,
    status: ad.status,
    campaignName: ad.resultType,
    budget: `₹${ad.costPerResult.toFixed(2)}/day`,
    amountSpent: formatINR(ad.amountSpent),
    reach: formatNumber(ad.viewers),
    impressions: formatNumber(ad.views),
    results: formatNumber(ad.results),
    costPerResult: `₹${ad.costPerResult.toFixed(2)}`,
    adId: ad.id,
  }));

  const filtered = adSets.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.campaignName.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };
  const toggleAll = () => {
    selectedIds.size === paginated.length
      ? setSelectedIds(new Set())
      : setSelectedIds(new Set(paginated.map(s => s.id)));
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1400px]">
      <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DADDE1]">
          <div>
            <h1 className="text-xl font-bold text-[#1C1E21]">Ad Sets</h1>
            <p className="text-xs text-[#65676B] mt-0.5">Manage your ad sets and targeting</p>
          </div>
          {isAdmin && (
            <Link href="/dashboard/ads">
              <button className="flex items-center gap-1.5 bg-[#0064E0] hover:bg-[#0052C2] text-white text-[13px] font-semibold px-3 py-2 rounded-md transition-colors">
                <Plus className="h-4 w-4" /> Create ad set
              </button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex px-3 border-b border-[#DADDE1] bg-white">
          {[
            { label: 'Campaigns', href: '/dashboard/campaigns' },
            { label: 'Ad Sets', href: '/dashboard/adsets' },
            { label: 'Ads', href: '/dashboard/ads' },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                tab.href === '/dashboard/adsets'
                  ? 'border-[#0064E0] text-[#0064E0]'
                  : 'border-transparent text-[#65676B] hover:text-[#1C1E21]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F9FA] border-b border-[#DADDE1] flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65676B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ad sets…"
              className="w-full bg-white border border-[#DADDE1] rounded-md text-[13px] pl-8 pr-3 py-1.5 text-[#1C1E21] placeholder:text-[#65676B] focus:outline-none focus:border-[#0064E0] transition-colors"
            />
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E7F3FF] rounded-md border border-[#0064E0]/20">
              <span className="text-xs font-semibold text-[#0064E0]">{selectedIds.size} selected</span>
              {isAdmin && (
                <>
                  <button className="flex items-center gap-1 text-xs text-[#1C1E21] bg-white border border-[#DADDE1] px-2 py-1 rounded hover:bg-[#F0F2F5]">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  <button className="flex items-center gap-1 text-xs text-[#1C1E21] bg-white border border-[#DADDE1] px-2 py-1 rounded hover:bg-[#F0F2F5]">
                    <Pause className="h-3 w-3" /> Pause
                  </button>
                  <button className="flex items-center gap-1 text-xs text-[#FA3E3E] bg-white border border-[#DADDE1] px-2 py-1 rounded hover:bg-red-50">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </>
              )}
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5]">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#65676B]" /> Filters
            </button>
            <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5]">
              <Columns className="h-3.5 w-3.5 text-[#65676B]" /> Columns
            </button>
            <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5]">
              <Download className="h-3.5 w-3.5 text-[#65676B]" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#DADDE1] bg-[#F8F9FA]">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length} onChange={toggleAll} className="h-3.5 w-3.5 rounded accent-[#0064E0] cursor-pointer" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Ad set name <ArrowUpDown className="h-3 w-3 inline ml-0.5 text-[#DADDE1]" /></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#65676B]">Delivery</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#65676B]">Campaign</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Budget <ArrowUpDown className="h-3 w-3 inline ml-0.5 text-[#DADDE1]" /></th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Amt. spent <ArrowUpDown className="h-3 w-3 inline ml-0.5 text-[#DADDE1]" /></th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Reach <ArrowUpDown className="h-3 w-3 inline ml-0.5 text-[#DADDE1]" /></th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Impressions</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Results</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Cost/result</th>
                {isAdmin && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-[#DADDE1]">
                    {[...Array(11)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-[#F0F2F5] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-[#65676B] text-sm">No ad sets found</td>
                </tr>
              ) : (
                paginated.map((adSet) => (
                  <tr key={adSet.id} className={`border-b border-[#DADDE1] hover:bg-[#F0F2F5] transition-colors ${selectedIds.has(adSet.id) ? 'bg-[#E7F3FF]' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(adSet.id)} onChange={() => toggleSelect(adSet.id)} className="h-3.5 w-3.5 rounded accent-[#0064E0] cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 min-w-[220px]">
                      <Link href={`/dashboard/ads/${adSet.adId}`} className="text-[13px] font-semibold text-[#0064E0] hover:underline line-clamp-1">{adSet.name}</Link>
                    </td>
                    <td className="px-4 py-3"><StatusDot status={adSet.status} /></td>
                    <td className="px-4 py-3 text-[13px] text-[#65676B] truncate max-w-[120px]">{adSet.campaignName}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">{adSet.budget}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-[#1C1E21]">{adSet.amountSpent}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">{adSet.reach}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">{adSet.impressions}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-[#1C1E21]">{adSet.results}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">{adSet.costPerResult}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#E7F3FF] text-[#65676B] transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#DADDE1] bg-white">
          <span className="text-xs text-[#65676B]">
            {loading ? 'Loading…' : `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} ad sets`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="h-7 w-7 flex items-center justify-center rounded border border-[#DADDE1] text-[#65676B] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} className={`h-7 w-7 flex items-center justify-center rounded text-xs font-medium border transition-colors ${page === i + 1 ? 'bg-[#0064E0] text-white border-[#0064E0]' : 'border-[#DADDE1] text-[#65676B] hover:bg-[#F0F2F5]'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-7 w-7 flex items-center justify-center rounded border border-[#DADDE1] text-[#65676B] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
