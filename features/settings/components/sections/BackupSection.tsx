"use client";

import { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Switch } from "@/shared/ui/Switch";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import {
  AlertTriangleIcon,
  ClockIcon,
  DatabaseIcon,
  RefreshCwIcon,
} from "@/shared/ui/Icons";
import { useToast } from "@/shared/hooks/useToast";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { Permissions } from "@/features/roles/types";
import { checkUserPermission } from "@/lib/auth";
import { useMe } from "@/features/auth/hooks/useAuth";
import {
  BackupConnectionStatus,
  BackupSettingsInput,
  BackupSettingsView,
  BackupStatus,
} from "../../api";
import {
  useBackupSettings,
  useBackupStatus,
  useRunBackupNow,
  useTestBackupConnection,
  useUpdateBackupSettings,
} from "../../hooks/useBackup";
import { errorMessage, formatBytes } from "../backups/backup-utils";

const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

const backupSchema = z.object({
  enabled: z.boolean(),
  backupsPerDay: z.string().regex(/^\d+$/),
  hour: z.string().regex(/^([01]\d|2[0-3])$/),
  minute: z.string().regex(/^[0-5]\d$/),
  retentionDays: z.string().regex(/^\d+$/),
  folderName: z
    .string()
    .trim()
    .min(1, "backup.errors.folderName")
    .max(100, "backup.errors.folderName")
    .regex(/^[^'"\\/]+$/, "backup.errors.folderName"),
});

type BackupForm = z.infer<typeof backupSchema>;

const toForm = (view: BackupSettingsView): BackupForm => {
  const [hour, minute] = view.settings.scheduleTime.split(":");
  return {
    enabled: view.settings.enabled,
    backupsPerDay: String(view.settings.backupsPerDay),
    hour,
    minute,
    retentionDays: String(view.settings.retentionDays),
    folderName: view.settings.googleDrive.folderName,
  };
};

/** Same spacing rule as the server: perDay runs, 24/perDay hours apart. */
function previewRunTimes(perDay: number, hour: string, minute: string) {
  if (!perDay || 24 % perDay !== 0) return [];
  const start = Number(hour);
  return Array.from(
    { length: perDay },
    (_, k) => (start + (k * 24) / perDay) % 24,
  )
    .sort((a, b) => a - b)
    .map((h) => `${String(h).padStart(2, "0")}:${minute}`);
}


const CONNECTION_BADGE: Record<
  BackupConnectionStatus,
  "success" | "danger" | "warning" | "secondary"
> = {
  connected: "success",
  failed: "danger",
  "not-configured": "warning",
  unknown: "secondary",
};

/**
 * Admin settings for automatic, encrypted database backups to Google Drive.
 * Saved through /backup/settings (its own API, outside the settings form).
 * Secrets (OAuth credentials, encryption key) are server-side only.
 */
export default function BackupSection() {
  const t = useTranslations("settings");
  const { data: view, isLoading, isError } = useBackupSettings();
  const { data: status } = useBackupStatus();
  const { data: user } = useMe();
  const can = (p: Permissions) => checkUserPermission(user || null, p, false);
  const canEdit = can(Permissions.MANAGE_BACKUP_SETTINGS);
  const canRun = can(Permissions.RUN_BACKUP);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-xl flex items-center gap-2 title-gradient">
            <DatabaseIcon className="w-5 h-5" /> {t("backup.title")}
          </CardTitle>
          <CardDescription>{t("backup.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-72 w-full bg-muted/20 animate-pulse rounded-2xl" />
          ) : isError || !view ? (
            <p className="text-sm text-destructive">{t("backup.loadError")}</p>
          ) : (
            <BackupSettingsForm view={view} canEdit={canEdit} />
          )}
        </CardContent>
      </Card>

      {view && (
        <BackupStatusCard
          status={status}
          canEdit={canEdit}
          canRun={canRun}
          serverReady={view.server.enabled && view.server.credentialsConfigured}
        />
      )}
    </div>
  );
}

function ServerNotices({ view }: { view: BackupSettingsView }) {
  const t = useTranslations("settings");
  const notices: string[] = [];
  if (!view.server.enabled) notices.push(t("backup.server.disabled"));
  if (view.server.missing.length > 0) {
    notices.push(
      t("backup.server.missing", { names: view.server.missing.join(", ") }),
    );
  }
  if (view.server.scheduleOverridden) {
    notices.push(t("backup.server.overridden"));
  }
  if (notices.length === 0) return null;
  return (
    <div
      role="status"
      className="flex items-start gap-3 p-4 rounded-2xl border border-warning/30 bg-warning/5 text-sm"
    >
      <AlertTriangleIcon className="w-5 h-5 text-warning shrink-0" />
      <ul className="space-y-1">
        {notices.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

function BackupSettingsForm({
  view,
  canEdit,
}: {
  view: BackupSettingsView;
  canEdit: boolean;
}) {
  const t = useTranslations("settings");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const toast = useToast();
  const confirm = useConfirmDialog();
  const updateMutation = useUpdateBackupSettings();
  const serverReady =
    view.server.enabled && view.server.credentialsConfigured;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<BackupForm>({
    resolver: zodResolver(backupSchema) as Resolver<BackupForm>,
    defaultValues: toForm(view),
  });

  useEffect(() => {
    reset(toForm(view));
  }, [view, reset]);

  const [enabled, backupsPerDay, hour, minute] = useWatch({
    control,
    name: ["enabled", "backupsPerDay", "hour", "minute"],
  });
  const runTimes = useMemo(
    () => previewRunTimes(Number(backupsPerDay), hour, minute),
    [backupsPerDay, hour, minute],
  );

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: view.timezone.timezone,
      }),
    [locale, view.timezone.timezone],
  );

  const toOptions = (values: number[], key: string) =>
    values.map((v) => ({ value: String(v), label: t(key, { count: v }) }));

  /** Only changed fields are sent (partial update on the server). */
  const buildPatch = (form: BackupForm): BackupSettingsInput => {
    const patch: BackupSettingsInput = {};
    if (dirtyFields.enabled) patch.enabled = form.enabled;
    if (dirtyFields.backupsPerDay) {
      patch.backupsPerDay = Number(form.backupsPerDay);
    }
    if (dirtyFields.hour || dirtyFields.minute) {
      patch.scheduleTime = `${form.hour}:${form.minute}`;
    }
    if (dirtyFields.retentionDays) {
      patch.retentionDays = Number(form.retentionDays);
    }
    if (dirtyFields.folderName) {
      patch.googleDrive = { folderName: form.folderName.trim() };
    }
    return patch;
  };

  const save = async (form: BackupForm) => {
    try {
      await updateMutation.mutateAsync(buildPatch(form));
      toast.success(t("backup.messages.saved"));
    } catch (err: unknown) {
      toast.error(errorMessage(err) || t("messages.updateError"));
      throw err;
    }
  };

  const onSubmit = (form: BackupForm) => {
    // Turning backups off is the disruptive change: confirm it.
    if (dirtyFields.enabled && !form.enabled) {
      confirm.openDialog({
        title: t("backup.confirmDisable.title"),
        message: t("backup.confirmDisable.message"),
        isDangerous: true,
        onConfirm: () => save(form),
      });
      return;
    }
    void save(form).catch(() => undefined);
  };

  const timezoneSourceLabel = t(`backup.timezone.source.${view.timezone.source}`);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ServerNotices view={view} />

      <fieldset disabled={!canEdit} className="space-y-6">
        <Controller
          control={control}
          name="enabled"
          render={({ field }) => (
            <Switch
              label={t("backup.fields.enabled")}
              description={t("backup.fields.enabledDesc")}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={!canEdit || (!serverReady && !field.value)}
              className="p-4 rounded-2xl border border-border/50"
            />
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="backup-per-day" className="text-sm font-semibold">
              {t("backup.fields.backupsPerDay")}
            </label>
            <Select
              id="backup-per-day"
              required
              options={toOptions(view.options.backupsPerDay, "backup.perDayOption")}
              {...register("backupsPerDay")}
            />
            <p className="text-xs text-muted-foreground">
              {t("backup.fields.backupsPerDayDesc")}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold block" id="backup-time-label">
              {t("backup.fields.scheduleTime")}
            </span>
            <div
              className="flex items-center gap-2"
              role="group"
              aria-labelledby="backup-time-label"
              dir="ltr"
            >
              <Select
                aria-label={t("backup.fields.hour")}
                required
                icon={ClockIcon}
                options={HOURS.map((h) => ({ value: h, label: h }))}
                {...register("hour")}
              />
              <span className="font-semibold">:</span>
              <Select
                aria-label={t("backup.fields.minute")}
                required
                options={(MINUTES.includes(minute)
                  ? MINUTES
                  : [...MINUTES, minute].sort()
                ).map((m) => ({ value: m, label: m }))}
                {...register("minute")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("backup.fields.runTimes", {
                times: runTimes.join(locale === "ar" ? "، " : ", "),
              })}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="backup-retention" className="text-sm font-semibold">
              {t("backup.fields.retentionDays")}
            </label>
            <Select
              id="backup-retention"
              required
              options={toOptions(view.options.retentionDays, "backup.daysOption")}
              {...register("retentionDays")}
            />
            <p className="text-xs text-muted-foreground">
              {t("backup.fields.retentionDesc", {
                min: view.options.minBackupsKept,
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Input
              label={t("backup.fields.folderName")}
              error={
                errors.folderName?.message
                  ? t(errors.folderName.message)
                  : undefined
              }
              {...register("folderName")}
            />
            <p className="text-xs text-muted-foreground">
              {t("backup.fields.folderNameDesc")}
            </p>
          </div>
        </div>
      </fieldset>

      <div className="rounded-2xl border border-border/50 bg-muted/10 p-4 text-sm space-y-1">
        <p>
          <span className="font-semibold">{t("backup.timezone.label")}: </span>
          <span dir="ltr">{view.timezone.timezone}</span>{" "}
          <span className="text-muted-foreground">({timezoneSourceLabel})</span>
        </p>
        {view.timezone.source === "fallback" && (
          <p className="text-warning text-xs">{t("backup.timezone.fallbackHint")}</p>
        )}
        {enabled && view.schedule.upcoming.length > 0 && !isDirty && (
          <p className="text-xs text-muted-foreground">
            {t("backup.fields.upcoming", {
              times: view.schedule.upcoming
                .map((d) => dateFormat.format(new Date(d)))
                .join(" · "),
            })}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t("backup.dstNote")}</p>
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            disabled={!isDirty}
          >
            {commonT("buttons.save")}
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.closeDialog}
        onConfirm={confirm.handleConfirm}
        title={confirm.title}
        message={confirm.message}
        isDangerous={confirm.isDangerous}
        isLoading={confirm.isLoading}
      />
    </form>
  );
}

function BackupStatusCard({
  status,
  canEdit,
  canRun,
  serverReady,
}: {
  status: BackupStatus | undefined;
  canEdit: boolean;
  canRun: boolean;
  serverReady: boolean;
}) {
  const t = useTranslations("settings");
  const locale = useLocale();
  const toast = useToast();
  const confirm = useConfirmDialog();
  const testMutation = useTestBackupConnection();
  const runMutation = useRunBackupNow();
  const notAvailable = t("backup.status.notAvailable");

  const fmtDate = (value: string | null | undefined) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(value))
      : notAvailable;

  const onTest = async () => {
    try {
      const result = await testMutation.mutateAsync();
      if (result.status === "connected") {
        toast.success(
          result.folderExists
            ? t("backup.messages.connected")
            : t("backup.messages.connectedNoFolder"),
        );
      } else {
        toast.error(t("backup.messages.connectionFailed"));
      }
    } catch (err: unknown) {
      toast.error(errorMessage(err) || t("backup.messages.connectionFailed"));
    }
  };

  const onRun = () =>
    confirm.openDialog({
      title: t("backup.runNow.title"),
      message: t("backup.runNow.message"),
      onConfirm: async () => {
        try {
          await runMutation.mutateAsync();
          toast.success(t("backup.messages.queued"));
        } catch (err: unknown) {
          toast.error(errorMessage(err) || t("backup.messages.runFailed"));
          throw err;
        }
      },
    });

  const connection = status?.connection.status ?? "unknown";
  const busy = !!status?.running || !!status?.manualQueued;

  const rows: { label: string; value: string; ltr?: boolean }[] = status
    ? [
        {
          label: t("backup.status.lastResult"),
          value: status.lastResult
            ? `${t(`backup.status.results.${status.lastResult.status}`)} — ${fmtDate(status.lastResult.at)}`
            : notAvailable,
        },
        {
          label: t("backup.status.lastSuccess"),
          value: fmtDate(status.lastSuccess?.at),
        },
        {
          label: t("backup.status.nextRun"),
          value: fmtDate(status.scheduler.nextRunAt),
        },
        {
          label: t("backup.status.size"),
          value: formatBytes(status.lastSuccess?.sizeBytes) ?? notAvailable,
          ltr: true,
        },
        {
          label: t("backup.status.fileId"),
          value: status.lastSuccess?.driveFileId ?? notAvailable,
          ltr: true,
        },
        {
          label: t("backup.status.uploads"),
          value: status.lastSuccess?.uploads
            ? t("backup.status.uploadsValue", {
                count: status.lastSuccess.uploads.files,
                size:
                  formatBytes(status.lastSuccess.uploads.totalBytes) ?? "0 B",
              })
            : notAvailable,
        },
        {
          label: t("backup.status.retained"),
          value:
            status.retainedCount != null
              ? String(status.retainedCount)
              : notAvailable,
        },
        {
          label: t("backup.status.lastFailure"),
          value: fmtDate(status.lastFailure?.at),
        },
      ]
    : [];

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{t("backup.status.title")}</CardTitle>
            <CardDescription>{t("backup.status.desc")}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={CONNECTION_BADGE[connection]}>
              {t(`backup.status.connection.${connection}`)}
            </Badge>
            {busy && (
              <Badge variant="info" className="gap-1">
                <RefreshCwIcon className="w-3 h-3 animate-spin" />
                {status?.running
                  ? t("backup.status.running")
                  : t("backup.status.queued")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!status ? (
          <div className="h-40 w-full bg-muted/20 animate-pulse rounded-2xl" />
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-border/50 p-3"
              >
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd
                  className="text-sm font-semibold break-all"
                  dir={row.ltr ? "ltr" : undefined}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {status?.lastFailure?.error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive mb-1">
              {t("backup.status.lastError")}
            </p>
            <p className="font-mono text-xs break-words" dir="ltr">
              {status.lastFailure.error}
            </p>
          </div>
        )}
        {connection === "failed" && status?.connection.error && (
          <p className="text-xs text-destructive font-mono" dir="ltr">
            {status.connection.error}
          </p>
        )}

        {(canEdit || canRun) && (
          <div className="flex flex-wrap justify-end gap-3">
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void onTest()}
                isLoading={testMutation.isPending}
                disabled={!status?.server.credentialsConfigured}
              >
                {t("backup.actions.testConnection")}
              </Button>
            )}
            {canRun && (
              <Button
                type="button"
                onClick={onRun}
                disabled={!serverReady || busy}
                title={busy ? t("backup.status.running") : undefined}
              >
                <DatabaseIcon /> {t("backup.actions.runNow")}
              </Button>
            )}
          </div>
        )}
      </CardContent>

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
