"use client";

import { useTranslations } from "next-intl";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";
import { Can } from "@/components/auth/Can";
import { Permissions } from "@/features/roles/types";
import BackupSection from "../sections/BackupSection";
import { useBackupSettings } from "../../hooks/useBackup";
import BackupFilesCard from "./BackupFilesCard";
import TestRestoreCard from "./TestRestoreCard";

/**
 * Admin > Backups: schedule & status, every backup in Google Drive (verify,
 * test restore, download, upload) and the test-restore slot. Guarded by the
 * dedicated backup permissions (the API enforces them too).
 */
export default function BackupsPage() {
  const t = useTranslations("settings");
  return (
    <Can
      permission={Permissions.VIEW_BACKUPS}
      fallback={
        <p className="p-8 text-center text-muted-foreground">
          {t("backup.page.noAccess")}
        </p>
      }
    >
      <BackupsContent />
    </Can>
  );
}

function BackupsContent() {
  const t = useTranslations("settings");
  const { data: view } = useBackupSettings();
  return (
    <div className="space-y-6">
      <EntityPageHeader
        title={t("backup.page.title")}
        subtitle={t("backup.page.subtitle")}
      />
      <BackupSection />
      <BackupFilesCard
        timezone={view?.timezone.timezone}
        uploadMaxBytes={view?.server.uploadMaxBytes}
      />
      <TestRestoreCard />
    </div>
  );
}
