"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Modal from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { AlertTriangleIcon, RefreshCwIcon } from "@/shared/ui/Icons";
import { useToast } from "@/shared/hooks/useToast";
import { cn } from "@/lib/utils";
import { BackupListItem, RestoreUploadsMode } from "../../api";
import { useBackupCheck, useRestoreUploads } from "../../hooks/useBackup";
import { errorMessage } from "./backup-utils";

const MODES: RestoreUploadsMode[] = ["preview", "restore", "overwrite"];
const LIST_LIMIT = 20;

/**
 * Restores a backup's uploaded files (images, attachments) into the live
 * uploads folder on the server, with the same three options as the CLI:
 * preview, add missing files only, or also replace files that differ.
 * Nothing is ever deleted. Rendered with `key={fileId}` so each backup
 * starts with a fresh state.
 */
export default function RestoreUploadsDialog({
  backup,
  dateLabel,
  onClose,
}: {
  backup: BackupListItem | null;
  dateLabel: string;
  onClose: () => void;
}) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const toast = useToast();
  const [mode, setMode] = useState<RestoreUploadsMode>("preview");
  const [confirmed, setConfirmed] = useState(false);
  const [checkId, setCheckId] = useState<string | null>(null);
  const start = useRestoreUploads();
  const { data: check } = useBackupCheck(checkId);

  const running =
    start.isPending ||
    (!!checkId && (!check || check.status === "queued" || check.status === "running"));
  const report = check?.report;
  const finished = check && (check.status === "succeeded" || check.status === "failed");
  const fmt = (n?: number) => new Intl.NumberFormat(locale).format(n ?? 0);

  const onStart = async () => {
    if (!backup) return;
    try {
      const res = await start.mutateAsync({ fileId: backup.fileId, mode });
      setCheckId(res.checkId);
    } catch (err) {
      toast.error(errorMessage(err) || t("messages.updateError"));
    }
  };

  const chooseAgain = (next: RestoreUploadsMode) => {
    setMode(next);
    setConfirmed(false);
    setCheckId(null);
  };

  const canStart = !running && (mode !== "overwrite" || confirmed);

  return (
    <Modal
      isOpen={!!backup}
      onClose={running ? () => undefined : onClose}
      title={t("backup.restoreFiles.title")}
      description={t("backup.restoreFiles.subtitle", { date: dateLabel })}
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={running}>
            {t("backup.restoreFiles.close")}
          </Button>
          {!checkId && (
            <Button
              type="button"
              variant={mode === "overwrite" ? "destructive" : "default"}
              onClick={() => void onStart()}
              disabled={!canStart}
              isLoading={start.isPending}
            >
              {t(`backup.restoreFiles.start.${mode}`)}
            </Button>
          )}
        </div>
      }
    >
      {!checkId ? (
        <div className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="sr-only">{t("backup.restoreFiles.modeLabel")}</legend>
            {MODES.map((m) => (
              <label
                key={m}
                className={cn(
                  "flex gap-3 items-start p-4 rounded-2xl border cursor-pointer transition-colors",
                  mode === m
                    ? m === "overwrite"
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-primary/50 bg-primary/5"
                    : "border-border/50 hover:bg-muted/30",
                )}
              >
                <input
                  type="radio"
                  name="restore-uploads-mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => {
                    setMode(m);
                    setConfirmed(false);
                  }}
                  className="mt-1"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-semibold">
                    {t(`backup.restoreFiles.modes.${m}.title`)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t(`backup.restoreFiles.modes.${m}.desc`)}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          {mode === "overwrite" && (
            <label className="flex gap-3 items-start p-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span>{t("backup.restoreFiles.overwriteConfirm")}</span>
            </label>
          )}

          <p className="text-xs text-muted-foreground flex gap-2">
            <AlertTriangleIcon className="w-4 h-4 shrink-0 text-warning" />
            {t("backup.restoreFiles.note")}
          </p>
        </div>
      ) : (
        <div className="space-y-4" aria-live="polite">
          <p className="text-sm font-semibold">
            {t(`backup.restoreFiles.modes.${check?.mode ?? mode}.title`)}
          </p>

          {running && (
            <div className="space-y-2">
              <p className="text-sm flex items-center gap-2">
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                {check?.progress
                  ? t("backup.restoreFiles.progress", {
                      done: fmt(check.progress.done),
                      total: fmt(check.progress.total),
                    })
                  : t("backup.restoreFiles.preparing")}
              </p>
              {check?.progress && check.progress.total > 0 && (
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.round((check.progress.done / check.progress.total) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {finished && check.status === "failed" && check.error && !report && (
            <p className="text-sm text-destructive font-mono break-words" dir="ltr">
              {check.error}
            </p>
          )}

          {finished && report && (
            <>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: report.dryRun
                      ? t("backup.restoreFiles.result.wouldWrite")
                      : t("backup.restoreFiles.result.written"),
                    value: report.restored,
                    cls: "text-success",
                  },
                  { label: t("backup.restoreFiles.result.unchanged"), value: report.unchanged, cls: "" },
                  { label: t("backup.restoreFiles.result.conflicts"), value: report.conflictsCount, cls: "text-warning" },
                  { label: t("backup.restoreFiles.result.missing"), value: report.missingCount, cls: "text-destructive" },
                  ...(report.failedCount
                    ? [{ label: t("backup.restoreFiles.result.failed"), value: report.failedCount, cls: "text-destructive" }]
                    : []),
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border/50 p-3">
                    <dt className="text-xs text-muted-foreground">{s.label}</dt>
                    <dd className={cn("text-lg font-bold", s.cls)}>{fmt(s.value)}</dd>
                  </div>
                ))}
              </dl>

              {!!report.conflictsCount && (
                <PathList
                  title={t("backup.restoreFiles.result.conflictsList", {
                    count: report.conflictsCount,
                  })}
                  hint={t("backup.restoreFiles.result.conflictsHint")}
                  paths={report.conflicts ?? []}
                  total={report.conflictsCount}
                />
              )}
              {!!report.failedCount && (
                <PathList
                  title={t("backup.restoreFiles.result.failedList", {
                    count: report.failedCount,
                  })}
                  hint={t("backup.restoreFiles.result.failedHint")}
                  paths={report.failed ?? []}
                  total={report.failedCount}
                  danger
                />
              )}
              {!!report.missingCount && (
                <PathList
                  title={t("backup.restoreFiles.result.missingList", {
                    count: report.missingCount,
                  })}
                  paths={report.missing ?? []}
                  total={report.missingCount}
                  danger
                />
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {report.dryRun && (
                  <Button type="button" onClick={() => chooseAgain("restore")}>
                    {t("backup.restoreFiles.next.restore")}
                  </Button>
                )}
                {!!report.conflictsCount && check.mode !== "overwrite" && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => chooseAgain("overwrite")}
                  >
                    {t("backup.restoreFiles.next.overwrite")}
                  </Button>
                )}
                {!report.dryRun && check.status === "succeeded" && (
                  <p className="text-sm text-success">{t("backup.restoreFiles.done")}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

function PathList({
  title,
  hint,
  paths,
  total,
  danger,
}: {
  title: string;
  hint?: string;
  paths: string[];
  total: number;
  danger?: boolean;
}) {
  const t = useTranslations("settings");
  return (
    <div
      className={cn(
        "rounded-2xl border p-3 space-y-2",
        danger ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5",
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <ul className="text-xs font-mono space-y-0.5 max-h-40 overflow-y-auto" dir="ltr">
        {paths.slice(0, LIST_LIMIT).map((p) => (
          <li key={p} className="truncate">
            {p}
          </li>
        ))}
      </ul>
      {total > LIST_LIMIT && (
        <p className="text-xs text-muted-foreground">
          {t("backup.restoreFiles.result.more", { count: total - LIST_LIMIT })}
        </p>
      )}
    </div>
  );
}
