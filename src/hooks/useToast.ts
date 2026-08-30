'use client';

import { useToast as useToastPrimitive } from '@/components/ui/toast';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

export function useToast() {
  const { toast, dismiss, toasts } = useToastPrimitive();

  const success = (message: string, description?: string, action?: ToastActionElement) => {
    return toast({ variant: 'success', title: message, description, action });
  };

  const error = (message: string, description?: string, action?: ToastActionElement) => {
    return toast({ variant: 'destructive', title: message, description, action });
  };

  const info = (message: string, description?: string, action?: ToastActionElement) => {
    return toast({ title: message, description, action });
  };

  return { toast, dismiss, toasts, success, error, info };
}