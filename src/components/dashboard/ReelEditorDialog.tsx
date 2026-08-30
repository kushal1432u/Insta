'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useManageReels } from '@/hooks/useManageReels';
import { ReelAnalytics } from '@/types';

interface ReelEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any | null; // using any to accept data from Ads/Reels tables easily
  onSaved: () => void;
}

export function ReelEditorDialog({ open, onOpenChange, initialData, onSaved }: ReelEditorDialogProps) {
  const { createReel, updateReel, loading } = useManageReels();

  const [formData, setFormData] = useState({
    title: '',
    username: '',
    reel_url: '',
    published_date: '',
    total_views: 0,
    organic_likes: 0,
    organic_comments: 0,
    engagement_rate: 0,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          username: initialData.username || '',
          reel_url: initialData.reel_url || '',
          published_date: initialData.published_date || initialData.startDate || new Date().toISOString().split('T')[0],
          total_views: initialData.total_views || initialData.views || 0,
          organic_likes: initialData.organic_likes || 0,
          organic_comments: initialData.organic_comments || 0,
          engagement_rate: initialData.engagement_rate || 0,
        });
      } else {
        setFormData({
          title: '',
          username: '',
          reel_url: '',
          published_date: new Date().toISOString().split('T')[0],
          total_views: 0,
          organic_likes: 0,
          organic_comments: 0,
          engagement_rate: 0,
        });
      }
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    let success = false;
    
    // Auto-calculate engagement (likes + comments) for mock realistic data if not provided directly
    const total_engagement = formData.organic_likes + formData.organic_comments;
    
    const payload = {
      ...formData,
      total_engagement,
      organic_views: formData.total_views, // just map directly for this simple CMS
    };

    if (initialData && initialData.id) {
      success = !!(await updateReel(initialData.id, payload));
    } else {
      success = !!(await createReel(payload));
    }

    if (success) {
      onSaved();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Reel / Ad' : 'Create New Reel / Ad'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Modify the details of this ad below.' : 'Enter the details for the new ad.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">Username</Label>
            <Input id="username" name="username" value={formData.username} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reel_url" className="text-right">Reel URL</Label>
            <Input id="reel_url" name="reel_url" value={formData.reel_url} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="published_date" className="text-right">Published Date</Label>
            <Input id="published_date" name="published_date" type="date" value={formData.published_date} onChange={handleChange} className="col-span-3" />
          </div>
          
          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3">Metrics (Used to calculate spend)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_views">Total Views</Label>
                <Input id="total_views" name="total_views" type="number" value={formData.total_views} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
                <Input id="engagement_rate" name="engagement_rate" type="number" step="0.1" value={formData.engagement_rate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organic_likes">Likes</Label>
                <Input id="organic_likes" name="organic_likes" type="number" value={formData.organic_likes} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organic_comments">Comments</Label>
                <Input id="organic_comments" name="organic_comments" type="number" value={formData.organic_comments} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
