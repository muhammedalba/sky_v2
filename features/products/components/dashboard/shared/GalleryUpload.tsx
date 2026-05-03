'use client';

import React, { useState } from 'react';
import { Icons } from '@/shared/ui/Icons';

interface GalleryUploadProps {
  previews: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
  t: (key: string) => string;
}

export default function GalleryUpload({
  previews,
  onAdd,
  onRemove,
  maxImages = 3, // Increased default to 5
  t
}: GalleryUploadProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3 pt-4 border-t border-border/40">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
            {t('galleryImages')}
          </h4>
          {previews.length > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {previews.length}
            </span>
          )}
        </div>
        <Icons.ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
            }`}
        />
      </div>

      {isExpanded ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs text-muted-foreground">{t('galleryDesc')}</p>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/40 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 " />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute inset-0 cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Icons.X className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
            {previews.length < maxImages && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Icons.Plus className="w-5 h-5 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) onAdd(e.target.files[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
        </div>
      ) : previews.length > 0 ? (
        <div className="flex items-center gap-2 pt-1">
          <div className="flex -space-x-3 overflow-hidden">
            {previews.slice(0, 4).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="inline-block h-10 w-10 rounded-lg ring-2 ring-card object-cover"
              />
            ))}
            {previews.length > 4 && (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-[10px] font-bold ring-2 ring-card">
                +{previews.length - 4}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="text-[10px] font-bold text-primary hover:underline ml-2"
          >
            {t('manageGallery')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full py-4 border border-dashed border-border/40 rounded-xl flex flex-col items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
        >
          <Icons.Plus className="w-5 h-5" />
          <span className="text-xs font-bold">{t('addGalleryImages')}</span>
        </button>
      )}
    </div>
  );
}
