"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Resolver, useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/shared/ui/Textarea";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { AlertTriangleIcon, PhoneIcon, SendIcon } from "@/shared/ui/Icons";
import { useToast } from "@/shared/hooks/useToast";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import { Permissions } from "@/features/roles/types";
import { checkUserPermission } from "@/lib/auth";
import { useMe } from "@/features/auth/hooks/useAuth";
import {
  AppUpdateStatus,
  AppVersionPolicy,
  AppVersionPolicyInput,
  AppVersionStats,
} from "../../api";
import {
  useAnnounceAppUpdate,
  useAppVersions,
  useAppVersionStats,
  useUpdateAppVersion,
} from "../../hooks/useAppVersions";
import {
  APP_VERSION_PATTERN,
  compareVersions,
  isValidAppVersion,
  resolveUpdateStatus,
} from "../../utils/app-version";

const MAX_LISTED_VERSIONS = 8;

const splitVersions = (value: string) =>
  value.split(/[,\s]+/).filter(Boolean);

const policySchema = z
  .object({
    latestVersion: z
      .string()
      .trim()
      .regex(APP_VERSION_PATTERN, "mobileApp.errors.version"),
    minSupportedVersion: z
      .string()
      .trim()
      .regex(APP_VERSION_PATTERN, "mobileApp.errors.version"),
    blockedVersions: z
      .string()
      .trim()
      .refine(
        (v) => splitVersions(v).every(isValidAppVersion),
        "mobileApp.errors.blocked",
      ),
    storeUrl: z
      .string()
      .trim()
      .refine((v) => !v || /^https:\/\/\S+$/.test(v), "mobileApp.errors.storeUrl"),
    notesAr: z.string().trim().max(2000),
    notesEn: z.string().trim().max(2000),
  })
  .refine(
    (d) => !(compareVersions(d.minSupportedVersion, d.latestVersion) > 0),
    { path: ["minSupportedVersion"], message: "mobileApp.errors.minAboveLatest" },
  )
  // The API takes release notes in both languages (3+ chars each) or none.
  .refine(
    (d) =>
      (!d.notesAr && !d.notesEn) ||
      (d.notesAr.length >= 3 && d.notesEn.length >= 3),
    { path: ["notesAr"], message: "mobileApp.errors.notes" },
  );

type PolicyForm = z.infer<typeof policySchema>;

const toForm = (policy: AppVersionPolicy): PolicyForm => ({
  latestVersion: policy.latestVersion,
  minSupportedVersion: policy.minSupportedVersion,
  blockedVersions: policy.blockedVersions.join(", "),
  storeUrl: policy.storeUrl,
  notesAr: policy.releaseNotes?.ar ?? "",
  notesEn: policy.releaseNotes?.en ?? "",
});

const STATUS_BADGE: Record<AppUpdateStatus, "danger" | "warning" | "success"> = {
  required: "danger",
  optional: "warning",
  up_to_date: "success",
};

/**
 * Mobile app update policy per platform: publish a version (optional
 * update), raise the minimum (forced update), block a bad build, and
 * announce a release by push. Saved on its own, not with the settings form.
 */
export default function MobileAppSection() {
  const t = useTranslations("settings");
  const { data: policies, isLoading } = useAppVersions();
  const { data: stats } = useAppVersionStats();
  const { data: user } = useMe();
  const canEdit = checkUserPermission(
    user || null,
    Permissions.UPDATE_SETTINGS,
    false,
  );
  const canAnnounce = checkUserPermission(
    user || null,
    Permissions.SEND_NOTIFICATION,
    false,
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-xl flex items-center gap-2 title-gradient">
            <PhoneIcon className="w-5 h-5" /> {t("mobileApp.title")}
          </CardTitle>
          <CardDescription>{t("mobileApp.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="grid gap-2 text-xs text-muted-foreground list-disc ps-5">
            <li>{t("mobileApp.rules.optional")}</li>
            <li>{t("mobileApp.rules.required")}</li>
            <li>{t("mobileApp.rules.blocked")}</li>
            <li className="text-warning font-medium">
              {t("mobileApp.rules.storeFirst")}
            </li>
          </ul>
        </CardContent>
      </Card>

      {isLoading || !policies ? (
        <div className="h-96 w-full bg-muted/20 animate-pulse rounded-3xl border border-border/50" />
      ) : (
        policies.map((policy) => (
          <PlatformPolicyCard
            key={policy.platform}
            policy={policy}
            stats={stats?.find((s) => s.platform === policy.platform)}
            canEdit={canEdit}
            canAnnounce={canAnnounce}
          />
        ))
      )}
    </div>
  );
}

function PlatformPolicyCard({
  policy,
  stats,
  canEdit,
  canAnnounce,
}: {
  policy: AppVersionPolicy;
  stats?: AppVersionStats;
  canEdit: boolean;
  canAnnounce: boolean;
}) {
  const t = useTranslations("settings");
  const commonT = useTranslations("common");
  const toast = useToast();
  const updateMutation = useUpdateAppVersion();
  const announceMutation = useAnnounceAppUpdate();
  const confirm = useConfirmDialog();
  const platformLabel = t(`mobileApp.platforms.${policy.platform}`);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PolicyForm>({
    resolver: zodResolver(policySchema) as Resolver<PolicyForm>,
    defaultValues: toForm(policy),
  });

  useEffect(() => {
    reset(toForm(policy));
  }, [policy, reset]);

  const [latestVersion, minSupportedVersion, blockedVersions] = useWatch({
    control,
    name: ["latestVersion", "minSupportedVersion", "blockedVersions"],
  });

  // Installs the edited policy would force to update, before saving it.
  const forcedAfterSave = useMemo(() => {
    if (!stats) return 0;
    const draft = {
      latestVersion,
      minSupportedVersion,
      blockedVersions: splitVersions(blockedVersions ?? ""),
    };
    if (
      !isValidAppVersion(draft.latestVersion) ||
      !isValidAppVersion(draft.minSupportedVersion) ||
      !draft.blockedVersions.every(isValidAppVersion)
    ) {
      return stats.required;
    }
    return stats.versions
      .filter(
        (v) =>
          v.appVersion && resolveUpdateStatus(draft, v.appVersion) === "required",
      )
      .reduce((sum, v) => sum + v.devices, 0);
  }, [stats, latestVersion, minSupportedVersion, blockedVersions]);

  const newlyForced = stats ? forcedAfterSave - stats.required : 0;

  const errorText = (message?: string) => (message ? t(message) : undefined);

  const save = async (form: PolicyForm) => {
    const data: AppVersionPolicyInput = {
      latestVersion: form.latestVersion,
      minSupportedVersion: form.minSupportedVersion,
      blockedVersions: splitVersions(form.blockedVersions),
      ...(form.storeUrl && { storeUrl: form.storeUrl }),
      ...(form.notesAr && {
        releaseNotes: { ar: form.notesAr, en: form.notesEn },
      }),
    };
    try {
      await updateMutation.mutateAsync({ platform: policy.platform, data });
      toast.success(t("mobileApp.messages.saved", { platform: platformLabel }));
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message || t("messages.updateError"),
      );
      throw err;
    }
  };

  const onSubmit = (form: PolicyForm) => {
    if (newlyForced > 0) {
      confirm.openDialog({
        title: t("mobileApp.confirmForce.title"),
        message: t("mobileApp.confirmForce.message", {
          count: newlyForced,
          platform: platformLabel,
        }),
        isDangerous: true,
        onConfirm: () => save(form),
      });
      return;
    }
    void save(form).catch(() => undefined);
  };

  const onAnnounce = () =>
    confirm.openDialog({
      title: t("mobileApp.announce.title"),
      message: t("mobileApp.announce.message", {
        version: policy.latestVersion,
        platform: platformLabel,
      }),
      onConfirm: async () => {
        try {
          await announceMutation.mutateAsync(policy.platform);
          toast.success(t("mobileApp.messages.announced"));
        } catch (err: unknown) {
          toast.error(
            (err as { message?: string })?.message || t("messages.updateError"),
          );
          throw err;
        }
      },
    });

  const statTiles = stats
    ? [
        { label: t("mobileApp.stats.total"), value: stats.totalDevices, cls: "" },
        { label: t("mobileApp.stats.upToDate"), value: stats.upToDate, cls: "text-success" },
        { label: t("mobileApp.stats.optional"), value: stats.optional, cls: "text-warning" },
        { label: t("mobileApp.stats.required"), value: stats.required, cls: "text-destructive" },
      ]
    : [];

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-lg flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-primary" /> {platformLabel}
          </span>
          {policy.updatedAt && (
            <span className="text-[11px] font-normal text-muted-foreground">
              {t("mobileApp.updatedAt", {
                date: new Date(policy.updatedAt).toLocaleString(),
              })}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statTiles.map((tile) => (
                <div
                  key={tile.label}
                  className="p-3 border border-border/50 rounded-2xl text-center"
                >
                  <p className={`text-xl font-bold ${tile.cls}`}>{tile.value}</p>
                  <p className="text-[11px] text-muted-foreground">{tile.label}</p>
                </div>
              ))}
            </div>
            {stats.versions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stats.versions.slice(0, MAX_LISTED_VERSIONS).map((v) => (
                  <Badge
                    key={v.appVersion ?? "unknown"}
                    variant={v.status ? STATUS_BADGE[v.status] : "secondary"}
                    dir="ltr"
                  >
                    {v.appVersion ?? t("mobileApp.stats.unknown")} · {v.devices}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t("mobileApp.stats.hint")}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 pt-2 border-t border-border/50"
        >
          <fieldset disabled={!canEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Input
                  {...register("latestVersion")}
                  label={t("mobileApp.fields.latestVersion")}
                  placeholder="1.4.0"
                  dir="ltr"
                  error={errorText(errors.latestVersion?.message)}
                  className="rounded-xl h-11"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("mobileApp.fields.latestVersionDesc")}
                </p>
              </div>
              <div className="space-y-1.5">
                <Input
                  {...register("minSupportedVersion")}
                  label={t("mobileApp.fields.minSupportedVersion")}
                  placeholder="1.2.0"
                  dir="ltr"
                  error={errorText(errors.minSupportedVersion?.message)}
                  className="rounded-xl h-11"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("mobileApp.fields.minSupportedVersionDesc")}
                </p>
              </div>
              <div className="space-y-1.5">
                <Input
                  {...register("blockedVersions")}
                  label={t("mobileApp.fields.blockedVersions")}
                  placeholder="1.3.1, 1.3.2"
                  dir="ltr"
                  error={errorText(errors.blockedVersions?.message)}
                  className="rounded-xl h-11"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("mobileApp.fields.blockedVersionsDesc")}
                </p>
              </div>
              <div className="space-y-1.5">
                <Input
                  {...register("storeUrl")}
                  label={t("mobileApp.fields.storeUrl")}
                  placeholder={
                    policy.platform === "ios"
                      ? "https://apps.apple.com/app/id..."
                      : "https://play.google.com/store/apps/details?id=..."
                  }
                  dir="ltr"
                  error={errorText(errors.storeUrl?.message)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                {...register("notesAr")}
                label={t("mobileApp.fields.notesAr")}
                rows={3}
                error={errorText(errors.notesAr?.message)}
              />
              <Textarea
                {...register("notesEn")}
                label={t("mobileApp.fields.notesEn")}
                rows={3}
                dir="ltr"
                error={errorText(errors.notesEn?.message)}
              />
            </div>
          </fieldset>

          {newlyForced > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-sm">
              <AlertTriangleIcon className="w-5 h-5 text-destructive shrink-0" />
              <p>
                {t("mobileApp.forceWarning", {
                  count: newlyForced,
                  platform: platformLabel,
                })}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            {canAnnounce && (
              <Button
                type="button"
                variant="outline"
                onClick={onAnnounce}
                disabled={!policy.storeUrl || isDirty}
                title={
                  !policy.storeUrl
                    ? t("mobileApp.announce.needsStoreUrl")
                    : isDirty
                      ? t("mobileApp.announce.saveFirst")
                      : undefined
                }
              >
                <SendIcon /> {t("mobileApp.announce.button")}
              </Button>
            )}
            {canEdit && (
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                disabled={!isDirty}
              >
                {commonT("buttons.save")}
              </Button>
            )}
          </div>
        </form>
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
