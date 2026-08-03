"use client";

import { useState, useCallback } from "react";

interface DownloadFileOptions {
  /** Optional custom filename for the download */
  fileName?: string;
  /** Fallback to opening file in a new tab if blob fetch fails. Defaults to true. */
  fallbackToNewTab?: boolean;
}

export function useDownloadFile() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = useCallback(
    async (
      fileUrl: string | null | undefined,
      options?: DownloadFileOptions,
    ) => {
      if (!fileUrl) return;

      const { fileName, fallbackToNewTab = true } = options || {};
      setIsDownloading(true);

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;

        const defaultName =
          fileUrl.split("/").pop()?.split("?")[0] || "downloaded-file";
        link.download = fileName || defaultName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Failed to download file:", error);
        if (fallbackToNewTab) {
          window.open(fileUrl, "_blank");
        }
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  return { downloadFile, isDownloading };
}
