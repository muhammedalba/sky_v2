"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { DatabaseIcon, RefreshCwIcon } from "@/shared/ui/Icons";
import { useToast } from "@/shared/hooks/useToast";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { Permissions } from "@/features/roles/types";
import { useCan } from "@/components/auth/Can";
import { BackupCheck, BackupListItem } from "../../api";
import {
  useBackupCheck,
  useBackupFiles,
  useRefreshBackupFiles,
  useDeleteUploadedBackup,
  useDownloadBackup,
  useTestRestoreBackup,
  useUploadBackup,
  useVerifyBackup,
} from "../../hooks/useBackup";
import { errorMessage, formatBytes, httpStatus } from "./backup-utils";
import RestoreUploadsDialog from "./RestoreUploadsDialog";

const SOURCE_BADGE: Record<
  BackupListItem["source"],
  "default" | "info" | "warning" | "secondary"
> = {
  scheduled: "default",
  manual: "info",
  uploaded: "warning",
  unknown: "secondary",
};

/**
 * Every backup in Google Drive (made by the server or uploaded from a
 * device) with verify / test-restore / download / delete actions, each
 * gated by its own backup permission.
 */
export default function BackupFilesCard({
  timezone,
  uploadMaxBytes,
}: {
  timezone?: string;
  uploadMaxBytes?: number;
}) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const toast = useToast();
  const confirm = useConfirmDialog();
  const can = useCan();
  const perms = {
    verify: can(Permissions.VERIFY_BACKUP),
    restore: can(Permissions.RESTORE_BACKUP_TEST),
    download: can(Permissions.DOWNLOAD_BACKUP),
    restoreFiles: can(Permissions.RESTORE_BACKUP_FILES),
    upload: can(Permissions.UPLOAD_BACKUP),
  };

  const { data: files, isLoading, isError, isFetching } = useBackupFiles();
  const refreshFromDrive = useRefreshBackupFiles();
  const refetch = () => refreshFromDrive().catch(() => undefined);
  const verify = useVerifyBackup();
  const testRestore = useTestRestoreBackup();
  const download = useDownloadBackup();
  const remove = useDeleteUploadedBackup();
  const upload = useUploadBackup();
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [restoreFilesOf, setRestoreFilesOf] = useState<BackupListItem | null>(
    null,
  );
  /** Upload received; the server is sending it to Drive in the background. */
  const [importCheckId, setImportCheckId] = useState<string | null>(null);

  const onImportFinished = (check: BackupCheck) => {
    setImportCheckId(null);
    void refetch();
    if (check.status === "succeeded") toast.success(t("backup.upload.done"));
    else toast.error(check.error || t("backup.upload.failed"));
  };

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        ...(timezone && { timeZone: timezone }),
      }),
    [locale, timezone],
  );
  const fmtDate = (v: string | null) =>
    v ? dateFormat.format(new Date(v)) : t("backup.status.notAvailable");

  const run = async (
    id: string,
    action: () => Promise<unknown>,
    success: string,
  ) => {
    setPendingId(id);
    try {
      await action();
      toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err) || t("messages.updateError"));
      throw err;
    } finally {
      setPendingId(null);
    }
  };

  const onVerify = (b: BackupListItem) =>
    void run(
      b.fileId,
      () => verify.mutateAsync(b.fileId),
      t("backup.files.messages.verifyQueued"),
    ).catch(() => undefined);

  const onDownload = (b: BackupListItem) =>
    void run(
      b.fileId,
      () => download.mutateAsync(b.fileId),
      t("backup.files.messages.downloadStarted"),
    ).catch(() => undefined);

  const onTestRestore = (b: BackupListItem) =>
    confirm.openDialog({
      title: t("backup.testRestore.confirm.title"),
      message: t("backup.testRestore.confirm.message", {
        date: fmtDate(b.createdAt),
      }),
      onConfirm: () =>
        run(
          b.fileId,
          () => testRestore.mutateAsync(b.fileId),
          t("backup.testRestore.messages.queued"),
        ),
    });

  const onDelete = (b: BackupListItem) =>
    confirm.openDialog({
      title: t("backup.files.confirmDelete.title"),
      message: t("backup.files.confirmDelete.message", { name: b.name }),
      isDangerous: true,
      onConfirm: () =>
        run(
          b.fileId,
          () => remove.mutateAsync(b.fileId),
          t("backup.files.messages.deleted"),
        ),
    });

  const onPickFile = async (file: File | undefined) => {
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    if (!/\.(sgbk|tar)$/i.test(file.name)) {
      toast.error(t("backup.upload.wrongType"));
      return;
    }
    if (uploadMaxBytes && file.size > uploadMaxBytes) {
      toast.error(
        t("backup.upload.tooLarge", { max: formatBytes(uploadMaxBytes) ?? "" }),
      );
      return;
    }
    setUploadPercent(0);
    try {
      const queued = await upload.mutateAsync({
        file,
        onProgress: setUploadPercent,
      });
      setImportCheckId(queued.checkId);
    } catch (err) {
      toast.error(
        httpStatus(err) === 413
          ? t("backup.upload.tooLarge", {
              max: formatBytes(uploadMaxBytes ?? 0) ?? "",
            })
          : errorMessage(err) || t("backup.upload.failed"),
      );
    } finally {
      setUploadPercent(null);
    }
  };

  const verificationBadge = (b: BackupListItem) => {
    const v = b.verification;
    if (!v) {
      return <Badge variant="secondary">{t("backup.files.verify.none")}</Badge>;
    }
    if (v.status === "queued" || v.status === "running") {
      return (
        <Badge variant="info" className="gap-1">
          <RefreshCwIcon className="w-3 h-3 animate-spin" />
          {t("backup.files.verify.running")}
        </Badge>
      );
    }
    return v.status === "succeeded" ? (
      <Badge variant="success" title={fmtDate(v.at)}>
        ✓ {t("backup.files.verify.ok")}
      </Badge>
    ) : (
      <Badge variant="danger" title={v.error ?? undefined}>
        ✗ {t("backup.files.verify.failed")}
      </Badge>
    );
  };

  const actions = (b: BackupListItem) => {
    const busy =
      pendingId === b.fileId ||
      b.verification?.status === "queued" ||
      b.verification?.status === "running";
    return (
      <div className="flex flex-wrap gap-2 justify-end">
        {perms.verify && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onVerify(b)}
          >
            {t("backup.files.actions.verify")}
          </Button>
        )}
        {perms.restore && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onTestRestore(b)}
          >
            {t("backup.files.actions.testRestore")}
          </Button>
        )}
        {perms.restoreFiles && b.hasUploads && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pendingId === b.fileId}
            onClick={() => setRestoreFilesOf(b)}
          >
            {t("backup.files.actions.restoreFiles")}
          </Button>
        )}
        {perms.download && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pendingId === b.fileId}
            onClick={() => onDownload(b)}
            title={t("backup.files.downloadHint")}
          >
            {t("backup.files.actions.download")}
          </Button>
        )}
        {perms.upload && b.source === "uploaded" && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => onDelete(b)}
          >
            {t("backup.files.actions.delete")}
          </Button>
        )}
      </div>
    );
  };

  const details = (b: BackupListItem) =>
    [
      b.sizeBytes != null && formatBytes(b.sizeBytes),
      b.totalDocs != null && t("backup.files.docs", { count: b.totalDocs }),
      b.hasUploads
        ? b.uploadedFiles != null
          ? t("backup.files.files", { count: b.uploadedFiles })
          : t("backup.files.withFiles")
        : t("backup.files.noFiles"),
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5" /> {t("backup.files.title")}
            </CardTitle>
            <CardDescription>{t("backup.files.desc")}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label={t("backup.files.refresh")}
            >
              <RefreshCwIcon className={isFetching ? "animate-spin" : ""} />
            </Button>
            {perms.upload && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".sgbk,.tar"
                  className="hidden"
                  onChange={(e) => void onPickFile(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  size="sm"
                  isLoading={uploadPercent !== null || !!importCheckId}
                  onClick={() => fileInput.current?.click()}
                >
                  {uploadPercent !== null
                    ? t("backup.upload.progress", { percent: uploadPercent })
                    : importCheckId
                      ? t("backup.upload.processing")
                      : t("backup.upload.button")}
                </Button>
                {importCheckId && (
                  <ImportWatcher
                    checkId={importCheckId}
                    onFinished={onImportFinished}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="m-6 h-40 bg-muted/20 animate-pulse rounded-2xl" />
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">
            {t("backup.files.loadError")}
          </p>
        ) : !files?.length ? (
          <p className="p-6 text-sm text-muted-foreground">
            {t("backup.files.empty")}
          </p>
        ) : (
          <ul className="divide-y divide-border/50">
            {files.map((b) => (
              <li
                key={b.fileId}
                className="p-4 md:px-6 flex flex-col lg:flex-row lg:items-center gap-3"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{fmtDate(b.createdAt)}</span>
                    <Badge variant={SOURCE_BADGE[b.source]}>
                      {t(`backup.files.source.${b.source}`)}
                    </Badge>
                    {verificationBadge(b)}
                  </div>
                  <p className="text-xs text-muted-foreground">{details(b)}</p>
                  <p
                    className="text-[11px] text-muted-foreground/70 font-mono truncate"
                    dir="ltr"
                  >
                    {b.backupId}
                  </p>
                  {b.verification?.status === "failed" && b.verification.error && (
                    <p className="text-xs text-destructive font-mono wrap-break-word" dir="ltr">
                      {b.verification.error}
                    </p>
                  )}
                </div>
                {actions(b)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <RestoreUploadsDialog
        key={restoreFilesOf?.fileId ?? "none"}
        backup={restoreFilesOf}
        dateLabel={restoreFilesOf ? fmtDate(restoreFilesOf.createdAt) : ""}
        onClose={() => setRestoreFilesOf(null)}
      />

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.closeDialog}
        onConfirm={confirm.handleConfirm}
        title={confirm.title}
        message={confirm.message}
        isDangerous={confirm.isDangerous}
        isLoading={confirm.isLoading}
      />
    </Card>
  );
}

/** Polls a background import and reports once when it finishes. */
function ImportWatcher({
  checkId,
  onFinished,
}: {
  checkId: string;
  onFinished: (check: BackupCheck) => void;
}) {
  const { data: check } = useBackupCheck(checkId);
  const finished =
    check && (check.status === "succeeded" || check.status === "failed")
      ? check
      : null;
  const reported = useRef(false);
  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onFinished(finished);
    }
  }, [finished, onFinished]);
  return null;
}
