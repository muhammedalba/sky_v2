"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import {
  useCountries,
  useRegions,
  useCities,
} from "@/features/checkout/hooks/useCheckout";
import { CheckoutFormValues } from "../schemas/checkout.schema";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTrans } from "@/shared/hooks/useTrans";

interface CheckoutAddressStepProps {
  onNext: () => void;
  isSubmitting: boolean;
}

export function CheckoutAddressStep({
  onNext,
  isSubmitting,
}: CheckoutAddressStepProps) {
  const {
    register,
    control,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  const countryId = useWatch({ control, name: "countryId" });
  const regionId = useWatch({ control, name: "regionId" });

  const t = useTranslations("cart");
  const getTrans = useTrans();

  const { data: countries = [], isLoading: loadingCountries } = useCountries();
  const { data: regions = [], isLoading: loadingRegions } = useRegions(
    countryId || null
  );
  const { data: cities = [], isLoading: loadingCities } = useCities(
    regionId || null
  );

  const { watch } = useFormContext<CheckoutFormValues>();

  // Reset downstream locations on change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "countryId") {
        setValue("regionId", "");
        setValue("cityId", "");
      }
      if (name === "regionId") {
        setValue("cityId", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const handleContinue = async () => {
    const isValid = await trigger([
      "firstName",
      "lastName",
      "phone",
      "countryId",
      "regionId",
      "cityId",
      "street",
    ]);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/10 rounded-2xl">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t("address.title")}
        </h2>
      </div>

      <div className="space-y-6 pt-2">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              {...register("firstName")}
              label={t("address.first_name")}
              placeholder={t("address.first_name_placeholder")}
              required
            />
            {errors.firstName && (
              <span className="text-xs text-destructive mt-1 block">
                {errors.firstName.message}
              </span>
            )}
          </div>
          <div>
            <Input
              {...register("lastName")}
              label={t("address.last_name")}
              placeholder={t("address.last_name_placeholder")}
              required
            />
            {errors.lastName && (
              <span className="text-xs text-destructive mt-1 block">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <Input
            label={t("address.phone")}
            placeholder="+966 5X XXX XXXX"
            type="tel"
            {...register("phone")}
            required
          />
          {errors.phone && (
            <span className="text-xs text-destructive mt-1 block">
              {errors.phone.message}
            </span>
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {t("address.country")}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("countryId")}
            options={countries.map((c: any) => ({
              value: c._id,
              label: getTrans(c.name),
            }))}
            label={
              loadingCountries
                ? t("address.loading")
                : t("address.select_country")
            }
            disabled={loadingCountries}
            required
          />
          {errors.countryId && (
            <span className="text-xs text-destructive mt-1 block">
              {errors.countryId.message}
            </span>
          )}
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {t("address.region")}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("regionId")}
            options={regions.map((r: any) => ({
              value: r._id,
              label: getTrans(r.name),
            }))}
            label={
              loadingRegions
                ? t("address.loading")
                : t("address.select_region")
            }
            disabled={!countryId || loadingRegions}
            required
          />
          {errors.regionId && (
            <span className="text-xs text-destructive mt-1 block">
              {errors.regionId.message}
            </span>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {t("address.city")}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("cityId")}
            options={cities.map((c: any) => ({
              value: c._id,
              label: getTrans(c.name),
            }))}
            label={
              loadingCities
                ? t("address.loading")
                : t("address.select_city")
            }
            disabled={!regionId || loadingCities}
            required
          />
          {errors.cityId && (
            <span className="text-xs text-destructive mt-1 block">
              {errors.cityId.message}
            </span>
          )}
        </div>

        {/* Street */}
        <div>
          <Input
            {...register("street")}
            label={t("address.street")}
            placeholder={t("address.street_placeholder")}
            required
          />
          {errors.street && (
            <span className="text-xs text-destructive mt-1 block">
              {errors.street.message}
            </span>
          )}
        </div>

        {/* Building + Postal */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("building")}
            label={t("address.building")}
            placeholder={t("address.building_placeholder")}
          />
          <Input
            {...register("postalCode")}
            label={t("address.postal_code")}
            placeholder="12345"
          />
        </div>

        {/* Additional Info */}
        <div>
          <label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {t("address.additional_info")}
          </label>
          <textarea
            {...register("additionalInfo")}
            rows={3}
            className="flex w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t("address.additional_info_placeholder")}
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-border/40">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : null}
            {t("address.continue")}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
