"use client";

import { useTranslations } from "next-intl";
import ImageUpload from "@/shared/ui/form/ImageUpload";
import GalleryUpload from "./GalleryUpload";
import { EyeIcon, FileTextIcon, TrashIcon } from "@/shared/ui/Icons";
import { FileAsset } from "@/shared/types/file-asset";

interface ProductMediaPanelProps {
  // Cover
  coverPreview: string | null;
  onCoverChange: (file: File) => void;
  onCoverRemove: () => void;
  coverFieldError?: string;

  // Gallery
  galleryPreviews: FileAsset[];
  onGalleryAdd: (file: File) => void;
  onGalleryRemove: (index: number) => void;

  // PDF
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  /** Called when the user removes the attached PDF */
  onPdfRemove: () => void;
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
  onPdfRemove,
  existingPdfLabel,
}: ProductMediaPanelProps) {
  const t = useTranslations("products.form");

  return (
    <div className="rounded-xl border border-border/50 bg-card space-y-5">
      <div className="flex items-center gap-2 border-b border-border/40  bg-accent/60 rounded-t-xl p-4">
        <EyeIcon className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-bold text-sm title-gradient">
            {t("coverImage")}
          </h3>
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
      <div className="space-y-3 border-t border-border/50">
        <div className="bg-accent/60 p-4 flex items-center gap-1">
          <FileTextIcon className="w-6 h-6 text-primary" />
          <div>
            <h4 className="font-bold text-sm title-gradient ">
              {t("productPdf")}
            </h4>
            <p className="text-xs text-muted-foreground">{t("pdfDesc")}</p>
          </div>
        </div>
        <div className="p-4">
          {pdfFile || existingPdfLabel ? (
            /* ── Attached file row ── */
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 bg-muted/20 text-sm font-medium">
              <span className="truncate max-w-55">
                {pdfFile ? pdfFile.name : existingPdfLabel}
              </span>
              <button
                type="button"
                onClick={onPdfRemove}
                className="ml-1 p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Remove PDF"
              >
                <TrashIcon className="w-4 h-4 cursor-pointer" />
              </button>
            </div>
          ) : (
            /* ── Upload label ── */
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors text-sm font-medium">
              {t("attachPdf")}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => onPdfChange(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
