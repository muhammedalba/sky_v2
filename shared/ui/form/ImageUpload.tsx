'use client';

import { useRef, useState } from 'react';

import { Icons } from '@/shared/ui/Icons';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
  className?: string;
}

export default function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
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
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-border">
            <Image
              src={preview}
              alt="Upload preview"
              className="object-cover"
              fill
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
            >
              <Icons.Menu className="w-4 h-4 rotate-45" /> {/* Use generic X or trash */}
            </button>
          </div>
        ) : (
          <div 
            onClick={() => inputRef.current?.click()}
            className="w-40 h-40 rounded-xl border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 bg-secondary/20 flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <Icons.Products className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2" />
            <span className="text-xs text-muted-foreground font-medium group-hover:text-primary">Upload Image</span>
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
    </div>
  );
}
