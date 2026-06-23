"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

// UI Components
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Switch } from "@/shared/ui/Switch";
import { SearchableMultiSelect } from "@/shared/ui/form/SearchableMultiSelect";
import EntityPageHeader from "@/shared/ui/dashboard/EntityPageHeader";

// Icons
import { AiSparkIcon, CheckIcon, OrdersIcon, TagIcon } from "@/shared/ui/Icons";

// Hooks & Utilities
import {
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
} from "@/features/payments/hooks/usePaymentMethods";
import { useCountries } from "@/features/locations/hooks/useLocations";
import { useToast } from "@/shared/hooks/useToast";
import { useTrans } from "@/shared/hooks/useTrans";
import { cn } from "@/lib/utils";

// Types, Schemas & Constants
import {
  PaymentMethodFormValues,
  paymentMethodSchema,
} from "@/features/payments/payments.schema";
import { SearchOption } from "@/shared/ui/form/SearchableSelect";
import { CURRENCY_SEARCH_OPTIONS } from "@/shared/constants/currencies";
import { LocalizedString } from "@/types";
import { PaymentMethodRow } from "../../types";

/**
 * Props for the PaymentMethodForm component.
 * @interface PaymentMethodFormProps
 * @property {PaymentMethodRow} [initialData] - Optional initial data for editing an existing payment method. If omitted, the form acts as a creation form.
 */
interface PaymentMethodFormProps {
  initialData?: PaymentMethodRow;
}

/**
 * PaymentMethodForm Component
 * * Handles both the creation and updating of a Payment Method entity.
 * Integrates `react-hook-form` with `zod` for robust schema validation.
 * * @param {PaymentMethodFormProps} props - The component props.
 * @returns {JSX.Element} The rendered form component.
 */
export default function PaymentMethodForm({
  initialData,
}: PaymentMethodFormProps) {
  // ===========================================================================
  // Hooks & Integrations
  // ===========================================================================
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const toast = useToast();
  const getTrans = useTrans();

  // Translations
  const t = useTranslations("paymentMethods");
  const tCommon = useTranslations("common");
  const tButtons = useTranslations("common.buttons");

  // Mutations & Queries
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const { data: countries = [], isLoading: isLoadingCountries } =
    useCountries();

  // ===========================================================================
  // Form Initialization
  // ===========================================================================
  const form = useForm<PaymentMethodFormValues>({
    // @ts-expect-error: zodResolver type mismatch with react-hook-form
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: initialData?.name && typeof initialData.name === 'object' 
        ? { ar: initialData.name.ar || "", en: initialData.name.en || "" } 
        : { ar: "", en: "" },
      code: initialData?.code || "",
      type: initialData?.type || "card",
      provider: initialData?.provider || "",
      description: initialData?.description && typeof initialData.description === 'object'
        ? { ar: initialData.description.ar || "", en: initialData.description.en || "" }
        : { ar: "", en: "" },
      feeType: initialData?.feeType || "fixed",
      publicConfig: initialData?.publicConfig || {},
      secretConfig: initialData?.secretConfig || {},
      fixedFee: initialData?.fixedFee || 0,
      percentageFee: initialData?.percentageFee || 0,
      isActive: initialData?.isActive ?? true,
      isDefault: initialData?.isDefault ?? false,
      requiresOnlineConfirmation:
        initialData?.requiresOnlineConfirmation ?? false,
      passFeesToCustomer: initialData?.passFeesToCustomer ?? false,
      displayOrder: initialData?.displayOrder || 0,
      supportedCurrencies: initialData?.supportedCurrencies || ["SAR"],
      supportedCountries: initialData?.supportedCountries || [],
      requiresAdditionalInfo: initialData?.requiresAdditionalInfo ?? false,
      icon: initialData?.icon || "",
    },
  });

  // ===========================================================================
  // Form Watchers
  // ===========================================================================
  const [
    isActive,
    isDefault,
    requiresOnlineConfirmation,
    requiresAdditionalInfo,
    passFeesToCustomer,
    watchedCurrencies,
    watchedCountries,
    watchedFeeType,
  ] = useWatch({
    control: form.control,
    name: [
      "isActive",
      "isDefault",
      "requiresOnlineConfirmation",
      "requiresAdditionalInfo",
      "passFeesToCustomer",
      "supportedCurrencies",
      "supportedCountries",
      "feeType",
    ],
  });

  const supportedCurrencies = watchedCurrencies || [];
  const supportedCountries = watchedCountries || [];
  const feeType = watchedFeeType || "fixed";

  // Boolean flag to disable inputs during submission
  const isPending = createMutation.isPending || updateMutation.isPending;

  // ===========================================================================
  // Memos
  // ===========================================================================
  /**
   * Memoized options for the Payment Method Type select field.
   * Prevents re-creating the array on every re-render triggered by form.watch().
   */
  const paymentTypeOptions = useMemo(
    () => [
      { value: "card", label: t("form.typeOptions.card") },
      { value: "wallet", label: t("form.typeOptions.wallet") },
      { value: "bank_transfer", label: t("form.typeOptions.bank_transfer") },
      { value: "cash_on_delivery", label: t("form.typeOptions.cash") },
      { value: "bnpl", label: t("form.typeOptions.bnpl") },
    ],
    [t],
  );

  const feeTypeOptions = useMemo(
    () => [
      { value: "fixed", label: t("form.feeTypeOptions.fixed", { defaultValue: "Fixed" }) },
      { value: "percentage", label: t("form.feeTypeOptions.percentage", { defaultValue: "Percentage" }) },
    ],
    [t],
  );

  // ===========================================================================
  // Handlers
  // ===========================================================================
  /**
   * Handles the form submission.
   * Routes to either update or create mutation based on the presence of `initialData`.
   * * @param {PaymentMethodFormValues} data - The validated form data.
   */
  const onSubmit = async (data: PaymentMethodFormValues) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, data });
        toast.success(tCommon("messages.updateSuccess"));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(tCommon("messages.success"));
      }
      router.push(`/${locale}/dashboard/payment-methods`);
    } catch (error) {
      console.error("Payment method submission failed:", error);
      toast.error(tCommon("errors.serverError"));
    }
  };

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header */}
      <EntityPageHeader
        title={initialData ? t("editPaymentMethod") : t("createPaymentMethod")}
        subtitle={t("managePaymentGatewaySettings")}
        action={{
          label: t("backToList"),
          icon: <OrdersIcon className="w-4 h-4" />,
          onClick: () => router.push(`/${locale}/dashboard/payment-methods`),
          disabled: isPending,
          className:
            "bg-muted text-foreground hover:bg-muted/80 shadow-none border border-border/40",
        }}
      />

      <form
        onSubmit={form.handleSubmit((data) =>
          onSubmit(data as unknown as PaymentMethodFormValues),
        )}
        className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {/* --- Basic Information Section --- */}
        <div className="bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
          <div className="flex items-center gap-4 border-b border-border/40 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              {/* Icon placeholder (e.g., CreditCardIcon) */}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {t("basicInformation")}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {t("mainDetails")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Input
                {...form.register("name.ar")}
                disabled={isPending}
                label={t("nameAr", { defaultValue: "Name (Arabic)" })}
                icon={TagIcon}
                placeholder={t("namePlaceholderAr", { defaultValue: "Enter Arabic Name" })}
                error={form.formState.errors.name?.ar?.message}
              />
            </div>

            <div className="space-y-2">
              <Input
                {...form.register("name.en")}
                disabled={isPending}
                label={t("nameEn", { defaultValue: "Name (English)" })}
                icon={TagIcon}
                placeholder={t("namePlaceholderEn", { defaultValue: "Enter English Name" })}
                error={form.formState.errors.name?.en?.message}
              />
            </div>

            <div className="space-y-2">
              <Input
                {...form.register("code")}
                disabled={isPending}
                label={t("form.codeLabel")}
                icon={TagIcon}
                placeholder={t("form.codePlaceholder")}
                error={form.formState.errors.code?.message}
              />
            </div>

            <div className="space-y-2">
              <Input
                {...form.register("provider")}
                disabled={isPending}
                label={t("provider")}
                icon={TagIcon}
                placeholder={t("providerPlaceholder")}
                error={form.formState.errors.provider?.message}
              />
            </div>

            <div className="space-y-2">
              <Select
                {...form.register("type")}
                disabled={isPending}
                label={t("form.typeLabel")}
                options={paymentTypeOptions}
                error={form.formState.errors.type?.message}
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Select
                {...form.register("feeType")}
                disabled={isPending}
                label={t("form.feeTypeLabel", { defaultValue: "Fee Type" })}
                options={feeTypeOptions}
                error={form.formState.errors.feeType?.message}
              />
            </div>

            {feeType === "fixed" && (
              <div className="space-y-2">
                <Input
                  {...form.register("fixedFee", { valueAsNumber: true })}
                  disabled={isPending}
                  type="number"
                  placeholder="0"
                  label={t("form.fixedFeeLabel")}
                  icon={AiSparkIcon}
                  error={form.formState.errors.fixedFee?.message}
                />
              </div>
            )}

            {feeType === "percentage" && (
              <div className="space-y-2">
                <Input
                  {...form.register("percentageFee", { valueAsNumber: true })}
                  disabled={isPending}
                  type="number"
                  placeholder="0"
                  label={t("form.percentageFeeLabel")}
                  icon={AiSparkIcon}
                  error={form.formState.errors.percentageFee?.message}
                />
              </div>
            )}

            <div className="space-y-2 lg:col-span-2">
              <Input
                {...form.register("description.ar")}
                disabled={isPending}
                label={t("descriptionAr", { defaultValue: "Description (Arabic)" })}
                icon={TagIcon}
                placeholder={t("descriptionPlaceholderAr", { defaultValue: "Enter Arabic description" })}
                error={form.formState.errors.description?.ar?.message}
              />
            </div>
            
            <div className="space-y-2 lg:col-span-2">
              <Input
                {...form.register("description.en")}
                disabled={isPending}
                label={t("descriptionEn", { defaultValue: "Description (English)" })}
                icon={TagIcon}
                placeholder={t("descriptionPlaceholderEn", { defaultValue: "Enter English description" })}
                error={form.formState.errors.description?.en?.message}
              />
            </div>

            <div className="space-y-2">
              <Input
                {...form.register("displayOrder", { valueAsNumber: true })}
                disabled={isPending}
                type="number"
                placeholder="0"
                label={t("form.displayOrderLabel")}
                icon={OrdersIcon}
                error={form.formState.errors.displayOrder?.message}
              />
            </div>

            <div className="space-y-2">
              <Input
                {...form.register("icon")}
                disabled={isPending}
                label={t("form.iconLabel")}
                icon={TagIcon}
                placeholder={t("form.iconPlaceholder")}
                error={form.formState.errors.icon?.message}
              />
            </div>
          </div>
        </div>

        {/* --- Currency & Countries Section --- */}
        <div className="relative z-20 bg-background/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-border/40 shadow-sm space-y-8">
          <div className="flex items-center gap-4 border-b border-border/40 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <AiSparkIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {t("form.supportedCurrenciesLabel")}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {t("form.supportedCurrenciesDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <SearchableMultiSelect
              label={t("form.currenciesLabel")}
              icon={AiSparkIcon}
              iconColor="text-orange-500"
              placeholder={t("form.selectCurrenciesPlaceholder")}
              selectedOptions={CURRENCY_SEARCH_OPTIONS.filter((o) =>
                supportedCurrencies.includes(o._id),
              )}
              onSearch={() => {}}
              onSelect={(opt) => {
                const current = form.getValues("supportedCurrencies") || [];
                if (!current.includes(opt._id)) {
                  form.setValue("supportedCurrencies", [...current, opt._id], {
                    shouldDirty: true,
                  });
                }
              }}
              onRemove={(id) => {
                const current = form.getValues("supportedCurrencies") || [];
                form.setValue(
                  "supportedCurrencies",
                  current.filter((item) => item !== id),
                  { shouldDirty: true },
                );
              }}
              options={CURRENCY_SEARCH_OPTIONS}
              getDisplayValue={(opt) => opt.name as string}
              error={form.formState.errors.supportedCurrencies?.message}
            />

            <SearchableMultiSelect
              label={t("form.countriesLabel")}
              placeholder={t("form.selectCountriesPlaceholder")}
              options={countries as unknown as SearchOption[]}
              selectedOptions={(countries as unknown as SearchOption[]).filter(
                (o) => supportedCountries.includes(o._id),
              )}
              onSearch={() => {}}
              onSelect={(opt) => {
                const current = form.getValues("supportedCountries") || [];
                if (!current.includes(opt._id)) {
                  form.setValue("supportedCountries", [...current, opt._id], {
                    shouldDirty: true,
                  });
                }
              }}
              onRemove={(id: string) => {
                const current = form.getValues("supportedCountries") || [];
                form.setValue(
                  "supportedCountries",
                  current.filter((item) => item !== id),
                  { shouldDirty: true },
                );
              }}
              getDisplayValue={(opt: SearchOption) =>
                getTrans(opt.name as LocalizedString)
              }
              createLink={`/dashboard/countries`}
              error={form.formState.errors.supportedCountries?.message}
              isLoading={isLoadingCountries}
            />
          </div>
        </div>

        {/* --- Public Config JSON Section --- */}
        <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-sm space-y-6 w-full">
          <div>
            <label className="text-sm font-bold text-foreground block mb-2">
              {t("form.publicConfigJsonLabel", { defaultValue: "Public Config JSON (Available to clients)" })}
            </label>
            <p className="text-xs text-muted-foreground mb-4">
              {t("form.publicConfigJsonDesc", { defaultValue: "Enter public configuration (e.g., publishable keys) in valid JSON format." })}
            </p>
            <textarea
              className="w-full h-32 p-3 rounded-xl border border-input bg-transparent text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-y"
              defaultValue={JSON.stringify(form.getValues("publicConfig"), null, 2)}
              disabled={isPending}
              onChange={(e) => {
                try {
                  form.setValue("publicConfig", JSON.parse(e.target.value));
                  form.clearErrors("publicConfig");
                } catch {
                  form.setError("publicConfig", { message: t("form.invalidJson", { defaultValue: "Invalid JSON" }) });
                }
              }}
            />
            {form.formState.errors.publicConfig && (
              <p className="text-red-500 text-sm mt-1">
                {
                  (
                    form.formState.errors.publicConfig as unknown as {
                      message: string;
                    }
                  ).message
                }
              </p>
            )}
          </div>
        </div>

        {/* --- Secret Config JSON Section --- */}
        <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-sm space-y-6 w-full">
          <div>
            <label className="text-sm font-bold text-foreground block mb-2">
              {t("form.secretConfigJsonLabel", { defaultValue: "Secret Config JSON (Encrypted in DB)" })}
            </label>
            <p className="text-xs text-muted-foreground mb-4">
              {t("form.secretConfigJsonDesc", { defaultValue: "Enter secret configuration (e.g., secret keys, webhooks) in valid JSON format." })}
            </p>
            <textarea
              className="w-full h-32 p-3 rounded-xl border border-input bg-transparent text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-y"
              defaultValue={JSON.stringify(form.getValues("secretConfig"), null, 2)}
              disabled={isPending}
              onChange={(e) => {
                try {
                  form.setValue("secretConfig", JSON.parse(e.target.value));
                  form.clearErrors("secretConfig");
                } catch {
                  form.setError("secretConfig", { message: t("form.invalidJson", { defaultValue: "Invalid JSON" }) });
                }
              }}
            />
            {form.formState.errors.secretConfig && (
              <p className="text-red-500 text-sm mt-1">
                {
                  (
                    form.formState.errors.secretConfig as unknown as {
                      message: string;
                    }
                  ).message
                }
              </p>
            )}
          </div>
        </div>

        {/* --- Boolean Settings / Toggles Section --- */}
        <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-sm space-y-6 w-full">
          {/* Active Switch */}
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground">
                  {t("form.statusLabel")}
                </label>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  {t("form.statusDesc")}
                </p>
              </div>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors",
                  isActive
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20",
                )}
              >
                {isActive ? t("status.active") : t("status.inactive")}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <Switch
                checked={isActive}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked, { shouldDirty: true })
                }
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {isActive ? t("status.active") : t("status.inactive")}
                </p>
              </div>
            </div>
          </div>

          {/* Default Switch */}
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 mt-6">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground">
                  {t("form.defaultMethodLabel")}
                </label>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  {t("form.defaultMethodDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <Switch
                checked={isDefault}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  form.setValue("isDefault", checked, {
                    shouldDirty: true,
                  })
                }
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {isDefault ? t("form.default") : t("form.notDefault")}
                </p>
              </div>
            </div>
          </div>

          {/* Requires Online Confirmation Switch */}
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 mt-6">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground">
                  {t("form.requiresOnlineConfLabel")}
                </label>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  {t("form.requiresOnlineConfDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <Switch
                checked={requiresOnlineConfirmation}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  form.setValue("requiresOnlineConfirmation", checked, {
                    shouldDirty: true,
                  })
                }
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {requiresOnlineConfirmation ? t("form.yes") : t("form.no")}
                </p>
              </div>
            </div>
          </div>

          {/* Requires Additional Info Switch */}
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 mt-6">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground">
                  {t("form.requiresAdditionalInfoLabel")}
                </label>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  {t("form.requiresAdditionalInfoDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <Switch
                checked={requiresAdditionalInfo}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  form.setValue("requiresAdditionalInfo", checked, {
                    shouldDirty: true,
                  })
                }
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {requiresAdditionalInfo
                    ? t("form.yesRequireUpload")
                    : t("form.noUploadNeeded")}
                </p>
              </div>
            </div>
          </div>

          {/* Pass Fees To Customer Switch */}
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 mt-6">
              <div className="space-y-0.5">
                <label className="text-sm font-bold text-foreground">
                  {t("form.passFeesLabel")}
                </label>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  {t("form.passFeesDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
              <Switch
                checked={passFeesToCustomer}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  form.setValue("passFeesToCustomer", checked, {
                    shouldDirty: true,
                  })
                }
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {passFeesToCustomer
                    ? t("form.yesPassFees")
                    : t("form.noAbsorbFees")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Form Actions --- */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/dashboard/payment-methods`)}
            disabled={isPending}
            className="w-full sm:w-auto h-12 px-8 font-bold rounded-xl border-border/60 hover:bg-muted/50 transition-all active:scale-95"
          >
            {tButtons("cancel")}
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={isPending}
            className="w-full sm:w-auto h-12 px-10 font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            {initialData ? tButtons("save") : tButtons("create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
