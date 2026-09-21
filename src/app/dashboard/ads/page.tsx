'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAds } from '@/hooks/useAds';
import { formatINR, formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { InstagramPreview } from '@/components/ui/instagram-preview';
import { ReelEditorDialog } from '@/components/dashboard/ReelEditorDialog';
import { useManageReels } from '@/hooks/useManageReels';
import {
  Search,
  SlidersHorizontal,
  Columns,
  Download,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowUpDown,
} from 'lucide-react';

type SortField = 'title' | 'startDate' | 'results' | 'costPerResult' | 'amountSpent' | 'views' | 'viewers';
type SortDir = 'asc' | 'desc';

function StatusDot({ status }: { status: string }) {
  const isActive = status === 'Active';
  const isPaused = status === 'Paused';
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block h-2 w-2 rounded-full shrink-0 ${
          isActive ? 'bg-[#2DA44E]' : isPaused ? 'bg-[#F5A623]' : 'bg-[#65676B]'
        }`}
      />
      <span className="text-[13px] text-[#1C1E21]">{status}</span>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function AdsPage() {
  const { ads, loading, refetch } = useAds();
  const { deleteReel } = useManageReels();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'adsets' | 'ads'>('ads');
  const { isAdmin } = useAuth();

  const handleEdit = (ad: any) => { setEditingReel(ad); setEditorOpen(true); };
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      const ok = await deleteReel(id);
      if (ok) refetch();
    }
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = ads.filter((ad) =>
      ad.title.toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      let av: any = a[sortField as keyof typeof a];
      let bv: any = b[sortField as keyof typeof b];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [ads, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((a) => a.id)));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`h-3 w-3 ml-1 inline ${sortField === field ? 'text-[#0064E0]' : 'text-[#DADDE1]'}`}
    />
  );

  return (
    <div className="flex flex-col gap-4 max-w-[1400px]">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-white border border-[#DADDE1] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DADDE1]">
          <div>
            <h1 className="text-xl font-bold text-[#1C1E21]">Ads</h1>
            <p className="text-xs text-[#65676B] mt-0.5">Manage and analyze your Instagram reel ads</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingReel(null); setEditorOpen(true); }}
              className="flex items-center gap-1.5 bg-[#0064E0] hover:bg-[#0052C2] text-white text-[13px] font-semibold px-3 py-2 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create ad
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex px-3 border-b border-[#DADDE1] bg-white">
          {(['campaigns', 'adsets', 'ads'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[#0064E0] text-[#0064E0]'
                  : 'border-transparent text-[#65676B] hover:text-[#1C1E21] hover:border-[#DADDE1]'
              }`}
            >
              {tab === 'adsets' ? 'Ad Sets' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F9FA] border-b border-[#DADDE1] flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65676B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ads…"
              className="w-full bg-white border border-[#DADDE1] rounded-md text-[13px] pl-8 pr-3 py-1.5 text-[#1C1E21] placeholder:text-[#65676B] focus:outline-none focus:border-[#0064E0] transition-colors"
            />
          </div>

          {/* Action buttons that appear on selection */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E7F3FF] rounded-md border border-[#0064E0]/20">
              <span className="text-xs font-semibold text-[#0064E0]">{selectedIds.size} selected</span>
              {isAdmin && (
                <>
                  <button className="flex items-center gap-1 text-xs text-[#1C1E21] bg-white border border-[#DADDE1] px-2 py-1 rounded hover:bg-[#F0F2F5] transition-colors">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  <button className="flex items-center gap-1 text-xs text-[#FA3E3E] bg-white border border-[#DADDE1] px-2 py-1 rounded hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5] transition-colors">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#65676B]" />
              Filters
            </button>
            <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5] transition-colors">
              <Columns className="h-3.5 w-3.5 text-[#65676B]" />
              Columns
            </button>
            <button className="flex items-center gap-1.5 text-[13px] text-[#1C1E21] bg-white border border-[#DADDE1] px-3 py-1.5 rounded-md hover:bg-[#F0F2F5] transition-colors">
              <Download className="h-3.5 w-3.5 text-[#65676B]" />
              Export
            </button>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#DADDE1] bg-[#F8F9FA]">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-[#65676B] accent-[#0064E0] cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap cursor-pointer" onClick={() => handleSort('title')}>
                  Ad name <SortIcon field="title" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">
                  Delivery
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap cursor-pointer" onClick={() => handleSort('startDate')}>
                  Published <SortIcon field="startDate" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap cursor-pointer" onClick={() => handleSort('results')}>
                  Results <Info className="h-3 w-3 inline ml-0.5 text-[#65676B]" /> <SortIcon field="results" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap cursor-pointer" onClick={() => handleSort('costPerResult')}>
                  Cost per result <SortIcon field="costPerResult" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap cursor-pointer" onClick={() => handleSort('amountSpent')}>
                  Amt. spent <SortIcon field="amountSpent" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap cursor-pointer" onClick={() => handleSort('views')}>
                  Views <SortIcon field="views" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap cursor-pointer" onClick={() => handleSort('viewers')}>
                  Viewers <SortIcon field="viewers" />
                </th>
                {isAdmin && <th className="text-right px-4 py-3 text-xs font-semibold text-[#65676B] whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-[#DADDE1]">
                    {[...Array(isAdmin ? 10 : 9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[#F0F2F5] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="px-4 py-12 text-center text-[#65676B] text-sm">
                    No ads found
                  </td>
                </tr>
              ) : (
                paginated.map((ad) => (
                  <tr
                    key={ad.id}
                    className={`border-b border-[#DADDE1] hover:bg-[#F0F2F5] transition-colors ${selectedIds.has(ad.id) ? 'bg-[#E7F3FF]' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ad.id)}
                        onChange={() => toggleSelect(ad.id)}
                        className="h-3.5 w-3.5 rounded border-[#65676B] accent-[#0064E0] cursor-pointer"
                      />
                    </td>

                    {/* Ad name cell */}
                    <td className="px-4 py-3 min-w-[260px]">
                      <div className="flex items-start gap-3">
                        <InstagramPreview
                          url={ad.reel_url || `https://www.instagram.com/p/${ad.id}`}
                          size="small"
                        />
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#1C1E21] line-clamp-1">{ad.title}</div>
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#65676B]">
                            <span className="font-medium">Ad</span>
                            <span>·</span>
                            <span>Get more {ad.resultType.toLowerCase()}</span>
                          </div>
                          <div className="text-[11px] text-[#65676B] mt-0.5 truncate">by {ad.createdBy}</div>
                          <Link href={`/dashboard/ads/${ad.id}`}>
                            <button className="mt-1.5 text-[11px] font-semibold text-[#0064E0] hover:underline flex items-center gap-0.5">
                              View insights →
                            </button>
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Delivery / Status */}
                    <td className="px-4 py-3">
                      <StatusDot status={ad.status} />
                    </td>

                    {/* Published date */}
                    <td className="px-4 py-3 text-[13px] text-[#65676B] whitespace-nowrap">
                      {ad.startDate ? formatDate(ad.startDate) : '—'}
                    </td>

                    {/* Results */}
                    <td className="px-4 py-3 text-right">
                      <div className="text-[13px] font-semibold text-[#1C1E21]">{formatNumber(ad.results)}</div>
                      <div className="text-[11px] text-[#65676B]">{ad.resultType}</div>
                    </td>

                    {/* Cost per result */}
                    <td className="px-4 py-3 text-right">
                      <div className="text-[13px] font-semibold text-[#1C1E21]">₹{ad.costPerResult.toFixed(2)}</div>
                      <div className="text-[11px] text-[#65676B]">per {ad.resultType.slice(0, -1)}</div>
                    </td>

                    {/* Amount spent */}
                    <td className="px-4 py-3 text-right">
                      <div className="text-[13px] font-semibold text-[#1C1E21]">{formatINR(ad.amountSpent)}</div>
                      <div className="text-[11px] text-[#65676B]">over 6 days</div>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-[#1C1E21]">
                      {formatNumber(ad.views)}
                    </td>

                    {/* Viewers */}
                    <td className="px-4 py-3 text-right text-[13px] text-[#1C1E21]">
                      {formatNumber(ad.viewers)}
                    </td>

                    {/* Admin actions */}
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(ad)}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#E7F3FF] text-[#0064E0] transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-50 text-[#FA3E3E] transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ──────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#DADDE1] bg-white">
          <span className="text-xs text-[#65676B]">
            {loading ? 'Loading…' : `Showing ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} ads`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="h-7 w-7 flex items-center justify-center rounded border border-[#DADDE1] text-[#65676B] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`h-7 w-7 flex items-center justify-center rounded text-xs font-medium border transition-colors ${
                    page === pg
                      ? 'bg-[#0064E0] text-white border-[#0064E0]'
                      : 'border-[#DADDE1] text-[#65676B] hover:bg-[#F0F2F5]'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="h-7 w-7 flex items-center justify-center rounded border border-[#DADDE1] text-[#65676B] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {editorOpen && (
        <ReelEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          initialData={editingReel}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
