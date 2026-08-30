'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ReelAnalytics } from '@/types';
import { useToast } from '@/hooks/useToast';

export function useManageReels() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const createReel = async (data: Partial<ReelAnalytics>) => {
    setLoading(true);
    try {
      // Ensure required dates are set
      const payload = {
        ...data,
        fetched_at: new Date().toISOString(),
      };
      
      const { data: insertedData, error } = await supabase
        .from('reel_analytics')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Reel/Ad created successfully',
      });
      return insertedData;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create reel',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReel = async (id: string, data: Partial<ReelAnalytics>) => {
    setLoading(true);
    try {
      const { data: updatedData, error } = await supabase
        .from('reel_analytics')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Reel/Ad updated successfully',
      });
      return updatedData;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update reel',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteReel = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reel_analytics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Reel/Ad deleted successfully',
      });
      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete reel',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReel,
    updateReel,
    deleteReel,
    loading
  };
}
