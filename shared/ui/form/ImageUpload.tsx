'use client';

import { useRef, useState } from 'react';

import { Icons } from '@/shared/ui/Icons';
import Image from 'next/image';
import ErrorMessage from '../ErrorMessage';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ImageUploadProps {
  onChange: (file: File) => void;
  onRemove: () => void;
  className?: string;
  value?: string;
  error?: string | null | undefined;
  loading?: "eager" | "lazy";
}

export default function ImageUpload({ value, onChange, onRemove, className, error, loading = "lazy" }: ImageUploadProps) {
  const t = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  // Sync internal state if prop changes (e.g. initial value load)
  if (value !== preview && value) {
    setPreview(value);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    if (inputRef.current) inputRef.current.value = '';
    onRemove();
  };
  return (
    <div className={`flex flex-col gap-4  ${className}  `}>
      <div className="flex items-center gap-4 justify-center">
        {preview ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden  border border-border group">
            <Image
              src={preview}
              alt={t('upload.preview')}
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              fill
              loading={loading}
              priority={loading === "eager"}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute inset-0 text-white bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"

            >
              <Icons.X className="w-7 h-7 " /> {/* Use generic X or trash */}
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(`w-40 h-40 rounded-xl border-dashed border-2 ${error ? "border-destructive" : "border-muted-foreground/20 "} hover:border-primary/50 bg-secondary/20 flex flex-col items-center justify-center cursor-pointer transition-colors group`)}
          >
            <Icons.Products className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2" />
            <span className="text-xs text-muted-foreground font-medium group-hover:text-primary">{t('upload.title')}</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
