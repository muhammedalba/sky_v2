"use client";

import Modal from "@/shared/ui/Modal";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { FileAsset } from "@/shared/types/file-asset";

export interface ProductLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc?: FileAsset | string | null;
}

export default function ProductLightboxModal({
  isOpen,
  onClose,
  title,
  imageSrc,
}: ProductLightboxModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={title}
    >
      <div className="relative w-full aspect-square sm:aspect-video">
        <ImageWithFallback
          src={imageSrc}
          alt={title}
          fill
          preload
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-contain"
        />
      </div>
    </Modal>
  );
}
