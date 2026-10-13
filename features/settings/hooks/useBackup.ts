import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "@/lib/env";
import { backupApi, BackupSettingsInput, RestoreUploadsMode } from "../api";

const KEY = ["backup"] as const;

/** Backup settings, derived timezone and schedule preview (VIEW_BACKUPS). */
export function useBackupSettings() {
  return useQuery({
    queryKey: [...KEY, "settings"],
    queryFn: async () => (await backupApi.getSettings()).data,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Last runs, next run and connection state. Polls every 5 s while a backup
 * is running or a manual one is queued, otherwise refreshes on focus.
 */
export function useBackupStatus() {
  return useQuery({
    queryKey: [...KEY, "status"],
    queryFn: async () => (await backupApi.getStatus()).data,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      query.state.data?.running || query.state.data?.manualQueued
        ? 5000
        : false,
  });
}

export function useUpdateBackupSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BackupSettingsInput) =>
      (await backupApi.updateSettings(data)).data,
    onSuccess: (view) => {
      queryClient.setQueryData([...KEY, "settings"], view);
      void queryClient.invalidateQueries({ queryKey: [...KEY, "status"] });
    },
  });
}

export function useTestBackupConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await backupApi.testConnection()).data,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "status"] }),
  });
}

export function useRunBackupNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await backupApi.runNow()).data,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "status"] }),
  });
}

// ─── backups in Drive: list, verify, test restore, download, upload ─────────

const isBusy = (status?: string) => status === "queued" || status === "running";

/** Backups in Drive. Polls while any of them is being verified. */
export function useBackupFiles(enabled = true) {
  return useQuery({
    queryKey: [...KEY, "files"],
    queryFn: async () => (await backupApi.listFiles()).data,
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.data?.some((b) => isBusy(b.verification?.status))
        ? 3000
        : false,
  });
}

/** Reloads the list straight from Google Drive (the refresh button). */
export function useRefreshBackupFiles() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.fetchQuery({
      queryKey: [...KEY, "files"],
      queryFn: async () => (await backupApi.listFiles(true)).data,
      staleTime: 0,
    });
}

/** The current test-restore slot; polls while a test restore runs. */
export function useTestRestore() {
  return useQuery({
    queryKey: [...KEY, "test-restore"],
    queryFn: async () => (await backupApi.getTestRestore()).data,
    staleTime: 0,
    refetchInterval: (query) =>
      isBusy(query.state.data?.latest?.status) ? 3000 : false,
  });
}

function useInvalidateBackups() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [...KEY, "files"] });
    void queryClient.invalidateQueries({ queryKey: [...KEY, "test-restore"] });
  };
}

export function useVerifyBackup() {
  const invalidate = useInvalidateBackups();
  return useMutation({
    mutationFn: async (fileId: string) => (await backupApi.verify(fileId)).data,
    onSettled: invalidate,
  });
}

export function useTestRestoreBackup() {
  const invalidate = useInvalidateBackups();
  return useMutation({
    mutationFn: async (fileId: string) =>
      (await backupApi.testRestore(fileId)).data,
    onSettled: invalidate,
  });
}

export function useDropTestRestore() {
  const invalidate = useInvalidateBackups();
  return useMutation({
    mutationFn: async () => (await backupApi.dropTestRestore()).data,
    onSettled: invalidate,
  });
}

export function useDeleteUploadedBackup() {
  const invalidate = useInvalidateBackups();
  return useMutation({
    mutationFn: async (fileId: string) =>
      (await backupApi.deleteUploaded(fileId)).data,
    onSettled: invalidate,
  });
}

/**
 * Gets a one-time link and hands it to the browser's download manager, so a
 * large bundle streams straight to disk instead of into page memory.
 */
export function useDownloadBackup() {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const link = (await backupApi.downloadLink(fileId)).data;
      const base = env.API_URL.replace(/\/+$/, "");
      const a = document.createElement("a");
      a.href = `${base}/${link.path}`;
      a.download = link.fileName;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return link;
    },
  });
}

export function useUploadBackup() {
  const invalidate = useInvalidateBackups();
  return useMutation({
    mutationFn: async (vars: {
      file: File;
      onProgress?: (percent: number) => void;
    }) => (await backupApi.upload(vars.file, vars.onProgress)).data,
    onSettled: invalidate,
  });
}

/** One verification / restore record, polled while it is queued or running. */
export function useBackupCheck(checkId: string | null) {
  return useQuery({
    queryKey: [...KEY, "check", checkId],
    queryFn: async () => (await backupApi.getCheck(checkId!)).data,
    enabled: !!checkId,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.status === "error"
        ? false // e.g. 404: the check is gone, polling would never end
        : !query.state.data || isBusy(query.state.data.status)
          ? 2000
          : false,
  });
}

/** Restores (or previews) a backup's uploaded files into the live folder. */
export function useRestoreUploads() {
  return useMutation({
    mutationFn: async (vars: { fileId: string; mode: RestoreUploadsMode }) =>
      (await backupApi.restoreUploads(vars.fileId, vars.mode)).data,
  });
}
