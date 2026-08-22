import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/Card";
import { Switch } from "@/shared/ui/Switch";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import {
  ActivityIcon,
  AlertTriangleIcon,
  DashboardIcon,
  DatabaseIcon,
  KeyIcon,
  RefreshCwIcon,
  SettingsIcon,
  TrashIcon,
} from "@/shared/ui/Icons";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/shared/hooks/useToast";
import { SettingsInput } from "../../settings.schema";
import { Permissions } from "@/features/roles/types";
import { checkUserPermission } from "@/lib/auth";
import { useMe } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function AdvancedSection() {
  const t = useTranslations("settings");
  const toast = useToast();
  const [isClearingCache, setIsClearingCache] = useState(false);
  const { data: user } = useMe();

  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<SettingsInput>();

  const storageProvider =
    useWatch({ control, name: "storageProvider" }) || "local";

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await apiClient.patch("/settings/clear-cache");
      toast.success(
        t("success.cacheMessage") || "System cache updated successfully",
        t("success.cacheTitle") || "Cache Cleared",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message;
      toast.error(
        message || "Failed to clear cache",
        t("errors.cacheTitle") || "Error",
      );
    } finally {
      setIsClearingCache(false);
    }
  };

  // Axis 2.1: Use useWatch for efficient re-renders
  const maintenanceMode = useWatch({ control, name: "maintenanceMode" });
  const allowRegistration = useWatch({ control, name: "allowRegistration" });
  const autoBackup = useWatch({ control, name: "autoBackup" });
  const enablePerformance = useWatch({ control, name: "enablePerformance" });
  const inventoryAlertsEnabled = useWatch({
    control,
    name: "inventoryAlertsEnabled",
  });

  const toggles = useMemo(
    () => [
      {
        id: "maintenanceMode",
        name: t("advanced.maintenance"),
        desc: t("advanced.maintenanceDesc"),
        icon: SettingsIcon,
        value: maintenanceMode,
        permission: Permissions.UPDATE_MAINTENANCE,
      },
      {
        id: "allowRegistration",
        name: t("advanced.registration"),
        desc: t("advanced.registrationDesc"),
        icon: DashboardIcon,
        value: allowRegistration,
      },
      {
        id: "autoBackup",
        name: t("advanced.backup"),
        desc: t("advanced.backupDesc"),
        icon: RefreshCwIcon,
        value: autoBackup,
      },
      {
        id: "enablePerformance",
        name: t("advanced.performance"),
        desc: t("advanced.performanceDesc"),
        icon: ActivityIcon,
        value: enablePerformance,
        permission: Permissions.UPDATE_DEBUG,
      },
      {
        id: "inventoryAlertsEnabled",
        name: t("advanced.inventoryAlerts") || "تنبيهات السلة",
        desc:
          t("advanced.inventoryAlertsDesc") ||
          "تفعيل تنبيهات نقص المخزون عند إضافة منتجات للسلة",
        icon: AlertTriangleIcon,
        value: inventoryAlertsEnabled,
        permission: Permissions.UPDATE_SETTINGS,
      },
    ],
    [
      t,
      maintenanceMode,
      allowRegistration,
      autoBackup,
      enablePerformance,
      inventoryAlertsEnabled,
    ],
  );

  const filteredNavigation = useMemo(() => {
    return toggles.filter((item) => {
      if (!item.permission) return true; // Available to all if no permission specified
      // requireAll = false allows viewing the item if the user has at least one of the specified permissions
      return checkUserPermission(user || null, item.permission, false);
    });
  }, [toggles, user]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-xl flex items-center gap-2 title-gradient">
            <SettingsIcon className="w-5 h-5 text-destructive" />{" "}
            {t("advanced.title")}
          </CardTitle>
          <CardDescription>{t("advanced.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNavigation.map((toggle) => (
              <div
                key={toggle.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-2xl hover:bg-muted/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <toggle.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{toggle.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {toggle.desc}
                    </p>
                  </div>
                </div>
                <Switch
                  // disabled={toggle.id === 'maintenanceMode'}
                  checked={!!toggle.value}
                  onCheckedChange={(checked) =>
                    setValue(toggle.id as keyof SettingsInput, checked, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border/50 space-y-4">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-primary" /> API Keys
            </h4>
            <Input
              {...register("googleMapsApiKey")}
              label="Google Maps API Key"
              placeholder="AIza..."
              error={errors.googleMapsApiKey?.message}
              className="rounded-xl h-11"
            />
          </div>

          {/* Storage Provider Selection */}
          <div className="pt-6 border-t border-border/50 space-y-4">
            <div>
              <h4 className="font-bold text-sm flex items-center gap-2">
                <DatabaseIcon className="w-4 h-4 text-primary" />
                {t("advanced.storageProvider")}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("advanced.storageProviderDesc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Storage Option */}
              <div
                onClick={() =>
                  setValue("storageProvider", "local", { shouldDirty: true })
                }
                className={cn(
                  "p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-2",
                  (storageProvider || "local") === "local"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/50 hover:bg-muted/10",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {t("advanced.storageLocal")}
                  </span>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      (storageProvider || "local") === "local"
                        ? "border-primary"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {(storageProvider || "local") === "local" && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("advanced.storageLocalDesc")}
                </p>
              </div>

              {/* Cloudinary Option */}
              <div
                onClick={() =>
                  setValue("storageProvider", "cloudinary", {
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-2",
                  storageProvider === "cloudinary"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/50 hover:bg-muted/10",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {t("advanced.storageCloudinary")}
                  </span>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      storageProvider === "cloudinary"
                        ? "border-primary"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {storageProvider === "cloudinary" && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("advanced.storageCloudinaryDesc")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {maintenanceMode && (
        <Card className="border-warning/50 bg-warning/5 shadow-xs rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-warning">
              <AlertTriangleIcon className="w-5 h-5" />{" "}
              {t("advanced.maintenanceMsg")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                {...register("maintenanceMessage.ar")}
                label="رسالة الصيانة (العربية)"
                className="rounded-xl min-h-[80px]"
                error={errors.maintenanceMessage?.ar?.message}
              />
              <Textarea
                {...register("maintenanceMessage.en")}
                label="Maintenance Message (English)"
                className="rounded-xl min-h-[80px]"
                error={errors.maintenanceMessage?.en?.message}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Axis 5: System Maintenance & Cache */}
      <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden mt-6">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-sm flex items-center gap-2 font-bold">
            <RefreshCwIcon className="w-4 h-4 text-primary" />{" "}
            {t("advanced.systemMaintenance") || "System Maintenance"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/30">
            <div className="space-y-1">
              <h5 className="text-sm font-bold">
                {t("advanced.clearCache") || "Clear System Cache"}
              </h5>
              <p className="text-[10px] text-muted-foreground">
                {t("advanced.clearCacheDesc") ||
                  "Rebuild internal cache for images, categories, and settings."}
              </p>
            </div>
            <button
              type="button"
              disabled={isClearingCache}
              onClick={handleClearCache}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold hover:bg-muted transition-all disabled:opacity-50"
            >
              {isClearingCache ? (
                <RefreshCwIcon className="w-3 h-3 animate-spin text-primary" />
              ) : (
                <TrashIcon className="w-3 h-3 text-destructive" />
              )}
              {t("advanced.clearButton") || "Clear Now"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
