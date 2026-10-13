import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';
import { SettingsInput } from './settings.schema';

/** GET /settings/cache-stats — backend response-cache counters (per instance). */
export interface CacheStats {
  entries: number | null;
  maxEntries: number;
  since: string;
  hits: number;
  misses: number;
  coalesced: number;
  hitRate: number | null;
  invalidations: number;
}

export type AppPlatform = "android" | "ios";
export type AppUpdateStatus = "up_to_date" | "optional" | "required";

/** GET /app-versions — update policy of the mobile app on one platform. */
export interface AppVersionPolicy {
  platform: AppPlatform;
  latestVersion: string;
  minSupportedVersion: string;
  blockedVersions: string[];
  storeUrl: string;
  releaseNotes: { ar: string; en: string };
  updatedAt?: string;
}

export type AppVersionPolicyInput = Partial<
  Omit<AppVersionPolicy, "platform" | "updatedAt">
>;

/** GET /app-versions/stats — registered installs per app version. */
export interface AppVersionStats {
  platform: AppPlatform;
  totalDevices: number;
  required: number;
  optional: number;
  upToDate: number;
  versions: {
    appVersion: string | null;
    devices: number;
    status: AppUpdateStatus | null;
  }[];
}

export const appVersionsApi = {
  getAll: (): Promise<ApiResponse<AppVersionPolicy[]>> =>
    apiClient.get("/app-versions"),
  getStats: (): Promise<ApiResponse<AppVersionStats[]>> =>
    apiClient.get("/app-versions/stats"),
  update: (
    platform: AppPlatform,
    data: AppVersionPolicyInput,
  ): Promise<ApiResponse<AppVersionPolicy>> =>
    apiClient.patch(`/app-versions/${platform}`, data),
  announce: (platform: AppPlatform) =>
    apiClient.post(`/app-versions/${platform}/announce`),
};

export const settingsApi = {
  get: (): Promise<ApiResponse<SettingsInput>> => apiClient.get('/settings'),
  update: (data: FormData | Partial<SettingsInput>): Promise<ApiResponse<SettingsInput>> => {
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : { 'Content-Type': 'application/json' };
      
    return apiClient.patch('/settings', data, { headers });
  },
  clearCache: () => apiClient.patch('/settings/clear-cache'),
  getCacheStats: (): Promise<ApiResponse<CacheStats>> =>
    apiClient.get('/settings/cache-stats'),
};

// ─── Database backups (/backup/*) ───────────────────────────────────────────
// Credentials (OAuth secret, refresh token, encryption key) stay on the server
// and are never part of these responses.

export interface BackupSettings {
  enabled: boolean;
  backupsPerDay: number;
  scheduleTime: string;
  retentionDays: number;
  googleDrive: { folderName: string; folderId: string };
}

export type BackupSettingsInput = Partial<
  Omit<BackupSettings, "googleDrive">
> & { googleDrive?: { folderName?: string } };

export type BackupTimezoneSource = "store-address" | "country-default" | "fallback";

/** GET /backup/settings */
export interface BackupSettingsView {
  settings: BackupSettings;
  timezone: {
    timezone: string;
    source: BackupTimezoneSource;
    countryCode: string | null;
  };
  schedule: { pattern: string; runTimes: string[]; upcoming: string[] };
  options: {
    backupsPerDay: number[];
    retentionDays: number[];
    minBackupsKept: number;
  };
  server: {
    enabled: boolean;
    credentialsConfigured: boolean;
    /** Names of missing server variables (never their values). */
    missing: string[];
    scheduleOverridden: boolean;
    /** Largest backup file the panel may upload. */
    uploadMaxBytes: number;
  };
}

export type BackupConnectionStatus =
  | "not-configured"
  | "connected"
  | "failed"
  | "unknown";

/** GET /backup/status */
export interface BackupStatus {
  server: BackupSettingsView["server"];
  scheduler: { active: boolean; nextRunAt: string | null };
  running: boolean;
  manualQueued: boolean;
  lastResult: {
    status: "succeeded" | "failed" | "skipped";
    at: string | null;
    trigger: "scheduled" | "manual" | null;
  } | null;
  lastSuccess: {
    at: string | null;
    fileName: string | null;
    driveFileId: string | null;
    sizeBytes: number | null;
    totalDocs: number | null;
    durationMs: number | null;
    consistency: "snapshot" | "none" | null;
    /** Local uploads folder saved with this backup (null: none on the server). */
    uploads: { files: number; totalBytes: number } | null;
  } | null;
  lastFailure: { at: string | null; error: string | null } | null;
  retainedCount: number | null;
  connection: {
    status: BackupConnectionStatus;
    checkedAt: string | null;
    error: string | null;
  };
}

export type BackupConnectionTest =
  | {
      status: "connected";
      folderName: string;
      folderExists: boolean;
      folderId: string | null;
    }
  | { status: "failed"; error: string };

export const backupApi = {
  getSettings: (): Promise<ApiResponse<BackupSettingsView>> =>
    apiClient.get("/backup/settings"),
  updateSettings: (
    data: BackupSettingsInput,
  ): Promise<ApiResponse<BackupSettingsView>> =>
    apiClient.patch("/backup/settings", data),
  getStatus: (): Promise<ApiResponse<BackupStatus>> =>
    apiClient.get("/backup/status"),
  testConnection: (): Promise<ApiResponse<BackupConnectionTest>> =>
    apiClient.post("/backup/test-connection"),
  runNow: (): Promise<ApiResponse<{ jobId: string | null; queued: boolean }>> =>
    apiClient.post("/backup/run"),

  /** `fresh`: skip the server's short Drive listing cache. */
  listFiles: (fresh = false): Promise<ApiResponse<BackupListItem[]>> =>
    apiClient.get("/backup/files", fresh ? { params: { fresh: 1 } } : undefined),
  getCheck: (checkId: string): Promise<ApiResponse<BackupCheck>> =>
    apiClient.get(`/backup/checks/${encodeURIComponent(checkId)}`),
  verify: (fileId: string): Promise<ApiResponse<BackupQueued>> =>
    apiClient.post(`/backup/files/${encodeURIComponent(fileId)}/verify`),
  testRestore: (fileId: string): Promise<ApiResponse<BackupQueued>> =>
    apiClient.post(`/backup/files/${encodeURIComponent(fileId)}/test-restore`),
  restoreUploads: (
    fileId: string,
    mode: RestoreUploadsMode,
  ): Promise<ApiResponse<BackupQueued>> =>
    apiClient.post(`/backup/files/${encodeURIComponent(fileId)}/restore-uploads`, {
      mode,
    }),
  getTestRestore: (): Promise<ApiResponse<TestRestoreState>> =>
    apiClient.get("/backup/test-restore"),
  dropTestRestore: (): Promise<ApiResponse<{ dbName: string }>> =>
    apiClient.delete("/backup/test-restore"),
  downloadLink: (fileId: string): Promise<ApiResponse<BackupDownloadLink>> =>
    apiClient.post(`/backup/files/${encodeURIComponent(fileId)}/download-link`),
  deleteUploaded: (fileId: string): Promise<ApiResponse<{ backupId: string }>> =>
    apiClient.delete(`/backup/files/${encodeURIComponent(fileId)}`),
  upload: (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<ApiResponse<BackupQueued>> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post("/backup/files/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      // Large uploads: no client-side timeout.
      timeout: 0,
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },
};

export type BackupFileSource = "scheduled" | "manual" | "uploaded" | "unknown";
export type BackupCheckStatus = "queued" | "running" | "succeeded" | "failed";

/** GET /backup/files */
export interface BackupListItem {
  fileId: string;
  backupId: string;
  name: string;
  source: BackupFileSource;
  createdAt: string | null;
  sizeBytes: number | null;
  totalDocs: number | null;
  hasUploads: boolean;
  uploadedFiles: number | null;
  verification: {
    status: BackupCheckStatus;
    trigger: "auto" | "manual";
    at: string | null;
    error: string | null;
  } | null;
}

export interface BackupQueued {
  checkId: string;
  jobId: string | null;
}

export interface TestRestoreRow {
  collection: string;
  backup: number;
  restored: number;
  live: number | null;
}

/** preview: report only · restore: add missing files · overwrite: also replace different ones */
export type RestoreUploadsMode = "preview" | "restore" | "overwrite";

export interface BackupCheck {
  _id: string;
  kind: "verify" | "test-restore" | "restore-uploads" | "import";
  mode: RestoreUploadsMode | null;
  status: BackupCheckStatus;
  driveFileId: string | null;
  backupId: string | null;
  trigger: "auto" | "manual";
  progress: { done: number; total: number } | null;
  dropped: boolean;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  report: {
    backupId?: string;
    createdAt?: string;
    dbName?: string;
    totalDocs?: number;
    views?: string[];
    indexes?: number;
    comparison?: TestRestoreRow[];
    collections?: Record<string, number>;
    consistency?: string;
    uploads?: {
      files: number;
      totalBytes: number;
      deep: boolean;
      missing: string[];
      corrupt: string[];
    } | null;
    // restore-uploads
    mode?: RestoreUploadsMode;
    files?: number;
    restored?: number;
    unchanged?: number;
    conflictsCount?: number;
    conflicts?: string[];
    missingCount?: number;
    missing?: string[];
    /** Corrupt or unreadable in Drive: nothing written for them. */
    failedCount?: number;
    failed?: string[];
    dryRun?: boolean;
  } | null;
}

/** GET /backup/test-restore */
export interface TestRestoreState {
  dbName: string;
  exists: boolean;
  /** An API instance has run on it: the server refuses to replace or drop it. */
  inUseAsLive: boolean;
  latest: BackupCheck | null;
}

export interface BackupDownloadLink {
  /** Relative to the API base URL. Valid once, for 60 seconds. */
  path: string;
  expiresAt: string;
  fileName: string;
  backupId: string;
}

/** `report` of an import check once the uploaded backup is in Drive. */
export interface BackupImportReport {
  fileId: string;
  backupId: string;
  format: "file" | "bundle";
  uploadedFiles: number;
  uploadedBlobs: number;
  verifyCheckId: string;
}
