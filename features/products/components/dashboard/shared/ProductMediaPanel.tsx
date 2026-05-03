'use client';

import { useTranslations } from 'next-intl';
import ImageUpload from '@/shared/ui/form/ImageUpload';
import GalleryUpload from './GalleryUpload';
import { Icons } from '@/shared/ui/Icons';

interface ProductMediaPanelProps {
  // Cover
  coverPreview: string | null;
  onCoverChange: (file: File) => void;
  onCoverRemove: () => void;
  coverFieldError?: string;

  // Gallery
  galleryPreviews: string[];
  onGalleryAdd: (file: File) => void;
  onGalleryRemove: (index: number) => void;

  // PDF
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  /** Shown when no new PDF is selected — e.g. "Current PDF attached" in Edit mode */
  existingPdfLabel?: string;
}

/**
 * Shared "Media" card — cover image, gallery, and PDF upload.
 * Used in both CreateProductForm and EditProductForm.
 */
export function ProductMediaPanel({
  coverPreview,
  onCoverChange,
  onCoverRemove,
  coverFieldError,
  galleryPreviews,
  onGalleryAdd,
  onGalleryRemove,
  pdfFile,
  onPdfChange,
  existingPdfLabel,
}: ProductMediaPanelProps) {
  const t = useTranslations('products.form');

  return (
    <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-border/40 pb-4">
        <Icons.Eye className="w-5 h-5 text-muted-foreground" />
        <div>
          <h3 className="font-bold text-sm">{t('coverImage')}</h3>
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-4">
        <ImageUpload
          error={coverFieldError}
          value={coverPreview || undefined}
          onChange={onCoverChange}
          onRemove={onCoverRemove}
        />
      </div>

      {/* Gallery */}
      <GalleryUpload
        previews={galleryPreviews}
        onAdd={onGalleryAdd}
        onRemove={onGalleryRemove}
        t={t}
      />

      {/* PDF */}
      <div className="space-y-3 pt-4 border-t border-border/40">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
          {t('productPdf')}
        </h4>
        <p className="text-xs text-muted-foreground">{t('pdfDesc')}</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors text-sm font-medium">
          {pdfFile
            ? pdfFile.name
            : existingPdfLabel
              ? existingPdfLabel
              : t('attachPdf')}
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => onPdfChange(e.target.files?.[0] || null)}
          />
        </label>
      </div>
    </div>
  );
}
