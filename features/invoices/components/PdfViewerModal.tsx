"use client";

import Modal from "@/shared/ui/Modal";

interface PdfViewerModalProps {
  /** The PDF's public URL; null closes the modal. */
  url: string | null;
  title?: string;
  onClose: () => void;
}

/** An issued invoice or credit note PDF, shown inline. */
export default function PdfViewerModal({
  url,
  title,
  onClose,
}: PdfViewerModalProps) {
  if (!url) return null;
  return (
    <Modal isOpen={!!url} onClose={onClose} title={title} size="xl">
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        className="w-full h-[75vh] border-none"
        title={title ?? "PDF"}
      />
    </Modal>
  );
}
