'use client';

import React from 'react';

export default function PlaceCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="relative aspect-[4/3] w-full bg-stone-200">
        {/* Shimmer Category Pill */}
        <div className="absolute top-3 left-3 h-6 w-24 bg-stone-300 rounded-full" />
        {/* Shimmer Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-stone-300/80" />
          <div className="w-8 h-8 rounded-full bg-stone-300/80" />
        </div>
        {/* Shimmer Bottom Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="h-4 w-32 bg-stone-300 rounded-md" />
          <div className="h-5 w-20 bg-stone-300 rounded-md" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          {/* Creator tag */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-stone-200" />
            <div className="h-3 w-28 bg-stone-200 rounded" />
          </div>
          {/* Title */}
          <div className="h-5 w-3/4 bg-stone-200 rounded-md" />
          {/* Description lines */}
          <div className="h-3.5 w-full bg-stone-100 rounded" />
          <div className="h-3.5 w-4/5 bg-stone-100 rounded" />
          {/* Price line */}
          <div className="h-3.5 w-1/2 bg-stone-200 rounded mt-1" />
        </div>

        {/* Meta Counters Skeleton */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-16 bg-stone-200 rounded" />
            <div className="h-3.5 w-10 bg-stone-200 rounded" />
          </div>
          <div className="h-3.5 w-12 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}
