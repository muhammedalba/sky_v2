import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Switch } from '@/shared/ui/Switch';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Icons } from '@/shared/ui/Icons';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/shared/hooks/useToast';
import { SettingsInput } from '../../settings.schema';

export default function AdvancedSection() {
  const t = useTranslations('settings');
  const toast = useToast();
  const [isClearingCache, setIsClearingCache] = useState(false);
  
  const { register, setValue, control, formState: { errors } } = useFormContext<SettingsInput>();

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await apiClient.patch('/settings/clear-cache');
      toast.success(t('success.cacheMessage') || 'System cache updated successfully', t('success.cacheTitle') || 'Cache Cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cache', t('errors.cacheTitle') || 'Error');
    } finally {
      setIsClearingCache(false);
    }
  };

  // Axis 2.1: Use useWatch for efficient re-renders
  const maintenanceMode = useWatch({ control, name: 'maintenanceMode' });
  const allowRegistration = useWatch({ control, name: 'allowRegistration' });
  const autoBackup = useWatch({ control, name: 'autoBackup' });
  const debugMode = useWatch({ control, name: 'debugMode' });

  const toggles = useMemo(() => [
    { id: 'maintenanceMode', name: t('advanced.maintenance'), desc: t('advanced.maintenanceDesc'), icon: Icons.Settings, value: maintenanceMode },
    { id: 'allowRegistration', name: t('advanced.registration'), desc: t('advanced.registrationDesc'), icon: Icons.Dashboard, value: allowRegistration },
    { id: 'autoBackup', name: t('advanced.backup'), desc: t('advanced.backupDesc'), icon: Icons.RefreshCw, value: autoBackup },
    { id: 'debugMode', name: t('advanced.debug'), desc: t('advanced.debugDesc'), icon: Icons.Activity, value: debugMode },
  ], [t, maintenanceMode, allowRegistration, autoBackup, debugMode]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-xl flex items-center gap-2 title-gradient">
            <Icons.Settings className="w-5 h-5 text-destructive" /> {t('advanced.title')}
          </CardTitle>
          <CardDescription>{t('advanced.desc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toggles.map((toggle) => (
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
                    <p className="text-[10px] text-muted-foreground">{toggle.desc}</p>
                  </div>
                </div>
                <Switch 
                  disabled={toggle.id === 'maintenanceMode'}
                  checked={!!toggle.value}
                  onCheckedChange={(checked) => setValue(toggle.id as any, checked, { shouldDirty: true })}
                />
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border/50 space-y-4">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Icons.Key className="w-4 h-4 text-primary" /> API Keys
            </h4>
            <Input
              {...register('googleMapsApiKey')}
              label="Google Maps API Key"
              placeholder="AIza..."
              error={errors.googleMapsApiKey?.message}
              className="rounded-xl h-11"
            />
          </div>
        </CardContent>
      </Card>

      {maintenanceMode && (
        <Card className="border-warning/50 bg-warning/5 shadow-xs rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-warning">
              <Icons.AlertTriangle className="w-5 h-5" /> {t('advanced.maintenanceMsg')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                {...register('maintenanceMessage.ar')}
                label="رسالة الصيانة (العربية)"
                className="rounded-xl min-h-[80px]"
                error={errors.maintenanceMessage?.ar?.message}
              />
              <Textarea
                {...register('maintenanceMessage.en')}
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
            <Icons.RefreshCw className="w-4 h-4 text-primary" /> {t('advanced.systemMaintenance') || 'System Maintenance'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/30">
            <div className="space-y-1">
              <h5 className="text-sm font-bold">{t('advanced.clearCache') || 'Clear System Cache'}</h5>
              <p className="text-[10px] text-muted-foreground">{t('advanced.clearCacheDesc') || 'Rebuild internal cache for images, categories, and settings.'}</p>
            </div>
            <button
              type="button"
              disabled={isClearingCache}
              onClick={handleClearCache}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold hover:bg-muted transition-all disabled:opacity-50"
            >
              {isClearingCache ? (
                <Icons.RefreshCw className="w-3 h-3 animate-spin text-primary" />
              ) : (
                <Icons.Trash className="w-3 h-3 text-destructive" />
              )}
              {t('advanced.clearButton') || 'Clear Now'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

