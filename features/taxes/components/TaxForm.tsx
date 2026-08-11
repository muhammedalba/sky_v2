"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Switch } from "@/shared/ui/Switch";
import { Select } from "@/shared/ui/Select";
import { useToast } from "@/shared/hooks/useToast";
import { Tax, useCreateTax, useUpdateTax } from "../hooks/useTaxes";
import { useCountries, useRegions, useCities } from "@/features/locations/hooks/useLocations";

const formSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  percentage: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0).max(100),
  ),
  scope: z.enum(['global', 'country', 'region', 'city']).default('global'),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  taxNumber: z.string().optional(),
  isIncludedInPrice: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.scope === 'country' && !data.country) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الدولة مطلوبة", path: ['country'] });
  }
  if (data.scope === 'region') {
    if (!data.country) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الدولة مطلوبة", path: ['country'] });
    if (!data.region) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "المنطقة مطلوبة", path: ['region'] });
  }
  if (data.scope === 'city') {
    if (!data.country) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الدولة مطلوبة", path: ['country'] });
    if (!data.region) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "المنطقة مطلوبة", path: ['region'] });
    if (!data.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "المدينة مطلوبة", path: ['city'] });
  }
});

interface TaxFormData {
  name: string;
  percentage: number;
  scope: 'global' | 'country' | 'region' | 'city';
  country?: string;
  region?: string;
  city?: string;
  taxNumber?: string;
  isIncludedInPrice: boolean;
  isActive: boolean;
  description?: string;
}

interface TaxFormProps {
  editingTax?: Tax | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaxForm({
  editingTax,
  onSuccess,
  onCancel,
}: TaxFormProps) {
  const t = useTranslations("taxes");
  const tCommon = useTranslations("buttons");
  const { success: toastSuccess, error: toastError } = useToast();

  const { data: countriesResponse } = useCountries();
  const countries = Array.isArray(countriesResponse)
    ? countriesResponse
    : (countriesResponse as any)?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "VAT",
      percentage: 15,
      scope: 'global',
      country: "",
      region: "",
      city: "",
      taxNumber: "",
      isIncludedInPrice: false,
      isActive: true,
      description: "",
    },
  });

  const watchScope = watch("scope");
  const watchCountry = watch("country");
  const watchRegion = watch("region");

  const { data: regionsResponse } = useRegions(watchCountry || undefined, true);
  const regions = Array.isArray(regionsResponse) ? regionsResponse : (regionsResponse as any)?.data || [];

  const { data: citiesResponse } = useCities(watchRegion || undefined, true);
  const cities = Array.isArray(citiesResponse) ? citiesResponse : (citiesResponse as any)?.data || [];

  useEffect(() => {
    if (editingTax) {
      reset({
        name: editingTax.name,
        percentage: editingTax.percentage,
        scope: editingTax.scope || (editingTax.country ? 'country' : 'global'),
        country: typeof editingTax.country === "object" ? editingTax.country?._id : editingTax.country || "",
        region: typeof editingTax.region === "object" ? editingTax.region?._id : editingTax.region || "",
        city: typeof editingTax.city === "object" ? editingTax.city?._id : editingTax.city || "",
        taxNumber: editingTax.taxNumber || "",
        isIncludedInPrice: editingTax.isIncludedInPrice,
        isActive: editingTax.isActive,
        description: editingTax.description || "",
      });
    }
  }, [editingTax, reset]);

  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: TaxFormData) => {
    try {
      const payload: Partial<TaxFormData> = { ...data };
      
      // التنظيف بناءً على النطاق المحدد
      if (payload.scope === 'global') {
        delete payload.country;
        delete payload.region;
        delete payload.city;
      } else if (payload.scope === 'country') {
        delete payload.region;
        delete payload.city;
      } else if (payload.scope === 'region') {
        delete payload.city;
      }

      if (editingTax) {
        await updateMutation.mutateAsync({ id: editingTax._id, data: payload as Partial<Tax> });
        toastSuccess("تم", "تم تحديث الضريبة بنجاح");
      } else {
        await createMutation.mutateAsync(payload as Partial<Tax>);
        toastSuccess("تم", "تم إضافة الضريبة بنجاح");
      }
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "حدث خطأ غير متوقع";
      toastError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("fields.name")}
          {...register("name")}
          error={errors.name?.message}
          dir="rtl"
          placeholder="مثال: ضريبة القيمة المضافة"
        />

        <Input
          type="number"
          step="0.01"
          label={t("fields.percentage")}
          {...register("percentage")}
          error={errors.percentage?.message}
          dir="rtl"
        />

        <Select
          label={t("fields.scope", { fallback: "النطاق" })}
          value={watchScope}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const val = e.target.value as TaxFormData['scope'];
            setValue("scope", val, { shouldValidate: true });
            if (val === 'global') {
              setValue("country", "");
              setValue("region", "");
              setValue("city", "");
            }
          }}
          options={[
            { value: "global", label: t("scopes.global", { fallback: "عالمي" }) },
            { value: "country", label: t("scopes.country", { fallback: "دولة" }) },
            { value: "region", label: t("scopes.region", { fallback: "منطقة" }) },
            { value: "city", label: t("scopes.city", { fallback: "مدينة" }) },
          ]}
          dir="rtl"
        />

        <Input
          label={t("fields.taxNumber")}
          {...register("taxNumber")}
          error={errors.taxNumber?.message}
          dir="rtl"
        />

        {watchScope !== 'global' && (
          <Select
            label={t("fields.country")}
            value={watchCountry}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setValue("country", e.target.value, { shouldValidate: true });
              setValue("region", "");
              setValue("city", "");
            }}
            options={[
              { value: "", disabled: true, label: t("globalFallback", { fallback: "اختر الدولة..." }) },
              ...countries.map((c: any) => ({
                value: c._id,
                label: c.name?.ar || c.name, 
              })),
            ]}
            error={errors.country?.message}
            dir="rtl"
          />
        )}

        {(watchScope === 'region' || watchScope === 'city') && (
          <Select
            label={t("fields.region", { fallback: "المنطقة" })}
            value={watchRegion}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setValue("region", e.target.value, { shouldValidate: true });
              setValue("city", "");
            }}
            options={[
              { value: "", disabled: true, label: "اختر المنطقة..." },
              ...regions.map((r: any) => ({
                value: r._id,
                label: r.name?.ar || r.name,
              })),
            ]}
            error={errors.region?.message}
            disabled={!watchCountry}
            dir="rtl"
          />
        )}

        {watchScope === 'city' && (
          <Select
            label={t("fields.city", { fallback: "المدينة" })}
            value={watch("city")}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setValue("city", e.target.value, { shouldValidate: true })
            }
            options={[
              { value: "", disabled: true, label: "اختر المدينة..." },
              ...cities.map((c: any) => ({
                value: c._id,
                label: c.name?.ar || c.name,
              })),
            ]}
            error={errors.city?.message}
            disabled={!watchRegion}
            dir="rtl"
          />
        )}
      </div>

      <Input
        label={t("fields.description")}
        {...register("description")}
        error={errors.description?.message}
        dir="rtl"
      />

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">
              {t("fields.isIncludedInPrice")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("fields.isIncludedInPriceDesc")}
            </p>
          </div>
          <Switch
            checked={watch("isIncludedInPrice")}
            onCheckedChange={(val: boolean) =>
              setValue("isIncludedInPrice", val)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{t("fields.isActive")}</p>
          <Switch
            checked={watch("isActive")}
            onCheckedChange={(val: boolean) => setValue("isActive", val)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? tCommon("saving") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
