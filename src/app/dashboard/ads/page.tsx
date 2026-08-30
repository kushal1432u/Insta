'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, Info, ArrowUpRight } from 'lucide-react';
import { useAds } from '@/hooks/useAds';
import { formatINR, formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { InstagramPreview } from '@/components/ui/instagram-preview';
import { Edit, Trash2 } from 'lucide-react';
import { ReelEditorDialog } from '@/components/dashboard/ReelEditorDialog';
import { useManageReels } from '@/hooks/useManageReels';

export default function AdsPage() {
  const { ads, loading, refetch } = useAds();
  const { deleteReel } = useManageReels();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<any | null>(null);

  const handleEdit = (ad: any) => {
    setEditingReel(ad);
    setEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      const success = await deleteReel(id);
      if (success) {
        refetch();
      }
    }
  };
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Ads</h1>
        {isAdmin && (
          <Button onClick={() => { setEditingReel(null); setEditorOpen(true); }} className="bg-[#0064e0] hover:bg-[#0052c2] text-white rounded-md">
            Create ad
          </Button>
        )}
      </div>



      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[300px] font-medium text-gray-900">Title</TableHead>
                <TableHead className="font-medium text-gray-900">Published Date ⇅</TableHead>
                <TableHead className="font-medium text-gray-900">Status ⇅</TableHead>
                <TableHead className="font-medium text-gray-900">Results ℹ ⇅</TableHead>
                <TableHead className="font-medium text-gray-900">Cost per result ℹ ⇅</TableHead>
                <TableHead className="font-medium text-gray-900">Amount spent ℹ ⇅</TableHead>
                <TableHead className="text-right font-medium text-gray-900">Views ℹ ⇅</TableHead>
                <TableHead className="text-right font-medium text-gray-900">Viewers ℹ ⇅</TableHead>
                {isAdmin && <TableHead className="text-right font-medium text-gray-900">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 9 : 8} className="h-32 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 9 : 8} className="h-32 text-center text-gray-500">
                    No ads found
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow key={ad.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <InstagramPreview url={ad.reel_url || `https://www.instagram.com/p/${ad.id}`} size="small" />
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1 text-sm">{ad.title}</div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                            <span className="font-medium">Ad</span>
                            <span>•</span>
                            <span>Get more {ad.resultType.toLowerCase()}</span>
                            <Info className="h-3 w-3 text-blue-500" />
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            Created by {ad.createdBy}
                          </div>
                          <div className="mt-2">
                            <Link href={`/dashboard/ads/${ad.id}`}>
                              <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                                View insights
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-gray-900">
                      {ad.startDate ? formatDate(ad.startDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`font-normal ${
                        ad.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        ad.status === 'Completed' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' :
                        'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }`}>
                        {ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{formatNumber(ad.results)}</div>
                      <div className="text-xs text-gray-500">{ad.resultType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">₹{ad.costPerResult.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Per {ad.resultType.slice(0, -1)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{formatINR(ad.amountSpent)}</div>
                      <div className="text-xs text-gray-500">spent over 6 days</div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-900">
                      {formatNumber(ad.views)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-900">
                      {formatNumber(ad.viewers)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)} className="h-8 w-8 text-blue-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)} className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
