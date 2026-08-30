'use client';

import { useState } from 'react';
import { extractReelIdFromUrl } from '@/lib/utils';
import { Play, Instagram, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface InstagramPreviewProps {
  url: string;
  size?: 'small' | 'large';
  className?: string;
}

export function InstagramPreview({ url, size = 'small', className = '' }: InstagramPreviewProps) {
  const shortcode = extractReelIdFromUrl(url);

  if (!shortcode) {
    return (
      <div className={`bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center rounded overflow-hidden ${size === 'small' ? 'w-12 h-12' : 'w-full h-full'} ${className}`}>
        <Instagram className="text-indigo-300 h-1/2 w-1/2" />
      </div>
    );
  }

  if (size === 'small') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className={`relative rounded overflow-hidden bg-gray-100 w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-90 ${className}`}>
            <iframe
              src={`https://www.instagram.com/p/${shortcode}/embed`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[400px] scale-[0.25] pointer-events-none opacity-90"
              frameBorder="0"
              scrolling="no"
              loading="lazy"
              tabIndex={-1}
            />
            <div className="absolute inset-0 z-10 bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors pointer-events-none">
              <Play className="w-4 h-4 fill-white opacity-80 shadow-sm" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[400px]">
          <div className="relative rounded-lg overflow-hidden bg-white border shadow-sm">
            <iframe
              src={`https://www.instagram.com/p/${shortcode}/embed`}
              className="w-full min-h-[550px]"
              frameBorder="0"
              scrolling="no"
              loading="lazy"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-white border shadow-sm ${className}`}>
      <iframe
        src={`https://www.instagram.com/p/${shortcode}/embed`}
        className="w-full min-h-[450px]"
        frameBorder="0"
        scrolling="no"
        loading="lazy"
      />
    </div>
  );
}
