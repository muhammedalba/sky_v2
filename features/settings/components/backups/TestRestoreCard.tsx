"use client";

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
import { AlertTriangleIcon, RefreshCwIcon } from "@/shared/ui/Icons";
import { useToast } from "@/shared/hooks/useToast";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { Permissions } from "@/features/roles/types";
import { checkUserPermission } from "@/lib/auth";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useDropTestRestore, useTestRestore } from "../../hooks/useBackup";
import { errorMessage } from "./backup-utils";

/**
 * Suggested database to restore a backup into before switching the store
 * to it: the live name + the backup's date and time (UTC), e.g.
 * `skyGalaxy_20261012_0300` for backup `2026-10-12T03-00-00Z-ab12cd`.
 * Clearly not the test slot (`<live>_restore`), and it tells which backup
 * the store runs on.
 */
function restoredDbName(slotName: string | undefined, backupId: string | null) {
  const live = slotName?.replace(/_restore$/, "") || "skyGalaxy";
  const m = backupId?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})/);
  const suffix = m
    ? `${m[1]}${m[2]}${m[3]}_${m[4]}${m[5]}`
    : (backupId ?? "backup").replace(/[^A-Za-z0-9]/g, "").slice(0, 20);
  return `${live}_${suffix}`;
}

/**
 * The single test-restore slot (`<db>_restore`): progress while it runs,
 * then a per-collection comparison with the live data, how to switch to it,
 * and a button to delete it (frees space on the cluster).
 */
export default function TestRestoreCard() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const toast = useToast();
  const confirm = useConfirmDialog();
  const { data: user } = useMe();
  const canRestore = checkUserPermission(
    user || null,
    Permissions.RESTORE_BACKUP_TEST,
    false,
  );
  const { data: state, isLoading } = useTestRestore();
  const drop = useDropTestRestore();

  const latest = state?.latest ?? null;
  const running = latest?.status === "queued" || latest?.status === "running";
  const report = latest?.report;
  const fmtDate = (v?: string | null) =>
    v
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(v))
      : t("backup.status.notAvailable");
  const fmtNum = (n: number) => new Intl.NumberFormat(locale).format(n);

  const onDrop = () =>
    confirm.openDialog({
      title: t("backup.testRestore.confirmDrop.title"),
      message: t("backup.testRestore.confirmDrop.message", {
        db: state?.dbName ?? "",
      }),
      isDangerous: true,
      onConfirm: async () => {
        try {
          await drop.mutateAsync();
          toast.success(t("backup.testRestore.messages.dropped"));
        } catch (err) {
          toast.error(errorMessage(err) || t("messages.updateError"));
          throw err;
        }
      },
    });

  const restoredName = restoredDbName(state?.dbName, latest?.backupId ?? null);

  const percent =
    latest?.progress && latest.progress.total > 0
      ? Math.min(100, Math.round((latest.progress.done / latest.progress.total) * 100))
      : 0;

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{t("backup.testRestore.title")}</CardTitle>
            <CardDescription>
              {t("backup.testRestore.desc", { db: state?.dbName ?? "…" })}
            </CardDescription>
          </div>
          {latest && (
            <Badge
              variant={
                running
                  ? "info"
                  : latest.status === "succeeded" && !latest.dropped
                    ? "success"
                    : latest.status === "failed"
                      ? "danger"
                      : "secondary"
              }
            >
              {latest.dropped && latest.status === "succeeded"
                ? t("backup.testRestore.state.dropped")
                : t(`backup.testRestore.state.${latest.status}`)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {isLoading ? (
          <div className="h-24 bg-muted/20 animate-pulse rounded-2xl" />
        ) : !latest ? (
          <p className="text-sm text-muted-foreground">
            {t("backup.testRestore.empty")}
          </p>
        ) : (
          <>
            <p className="text-sm">
              {t("backup.testRestore.source", {
                id: latest.backupId ?? "",
                date: fmtDate(report?.createdAt ?? latest.createdAt),
              })}
            </p>

            {running && (
              <div className="space-y-2" aria-live="polite">
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCwIcon className="w-4 h-4 animate-spin" />
                  {latest.progress
                    ? t("backup.testRestore.progress", {
                        done: fmtNum(latest.progress.done),
                        total: fmtNum(latest.progress.total),
                      })
                    : t("backup.testRestore.preparing")}
                </div>
                <div
                  className="h-2 rounded-full bg-muted overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}

            {latest.status === "failed" && latest.error && (
              <p className="text-sm text-destructive font-mono break-words" dir="ltr">
                {latest.error}
              </p>
            )}

            {latest.status === "succeeded" && report?.comparison && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-border/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-xs text-muted-foreground">
                      <tr>
                        <th className="p-2 text-start font-semibold">
                          {t("backup.testRestore.table.collection")}
                        </th>
                        <th className="p-2 text-end font-semibold">
                          {t("backup.testRestore.table.backup")}
                        </th>
                        <th className="p-2 text-end font-semibold">
                          {t("backup.testRestore.table.restored")}
                        </th>
                        <th className="p-2 text-end font-semibold">
                          {t("backup.testRestore.table.live")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.comparison.map((row) => {
                        const diff = row.live == null ? 0 : row.live - row.backup;
                        return (
                          <tr
                            key={row.collection}
                            className={
                              diff !== 0 ? "bg-warning/5" : "border-t border-border/30"
                            }
                          >
                            <td className="p-2 font-mono text-xs" dir="ltr">
                              {row.collection}
                            </td>
                            <td className="p-2 text-end">{fmtNum(row.backup)}</td>
                            <td className="p-2 text-end">{fmtNum(row.restored)}</td>
                            <td className="p-2 text-end">
                              {row.live == null ? "—" : fmtNum(row.live)}
                              {diff !== 0 && (
                                <span className="ms-1 text-warning text-xs" dir="ltr">
                                  ({diff > 0 ? "+" : ""}
                                  {fmtNum(diff)})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("backup.testRestore.diffHint")}
                </p>

                {!latest.dropped && (
                  <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4 text-warning" />
                      {t("backup.testRestore.switch.title")}
                    </p>
                    <p className="text-xs text-destructive font-semibold">
                      {t("backup.testRestore.switch.notTheSlot", { db: report.dbName ?? "" })}
                    </p>
                    <ol className="list-decimal ps-5 space-y-1 text-xs">
                      <li>{t("backup.testRestore.switch.step1")}</li>
                      <li>
                        {t("backup.testRestore.switch.step2")}{" "}
                        <code className="font-mono bg-muted px-1 rounded break-all" dir="ltr">
                          npm run backup:restore -- skygalaxy-{latest.backupId}.backup.tar
                          &quot;&lt;MONGODB_URI&gt;&quot; --db {restoredName}
                        </code>
                      </li>
                      <li>
                        {t("backup.testRestore.switch.step3")}{" "}
                        <code className="font-mono bg-muted px-1 rounded" dir="ltr">
                          MONGODB_DB_NAME={restoredName}
                        </code>
                      </li>
                      <li>{t("backup.testRestore.switch.step4")}</li>
                    </ol>
                    <p className="text-xs text-warning">{t("backup.testRestore.switch.warning")}</p>
                  </div>
                )}
              </div>
            )}

            {state?.inUseAsLive && (
              <p className="text-sm text-destructive flex gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
                <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                {t("backup.testRestore.inUseAsLive", { db: state.dbName })}
              </p>
            )}

            {canRestore && state?.exists && !running && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDrop}
                  isLoading={drop.isPending}
                  disabled={state.inUseAsLive}
                >
                  {t("backup.testRestore.drop")}
                </Button>
              </div>
            )}
          </>
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
