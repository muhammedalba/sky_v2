"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import {
  useCountries,
  useRegions,
  useCities,
  type LocationItem,
} from "@/features/checkout/hooks/useCheckout";
import { CheckoutFormValues } from "../schemas/checkout.schema";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useTrans } from "@/shared/hooks/useTrans";
import { Textarea } from "@/shared/ui/Textarea";
import { Button } from "@/shared/ui/Button";

interface CheckoutAddressStepProps {
  onNext: () => void;
  isSubmitting: boolean;
}

export function CheckoutAddressStep({
  onNext,
  isSubmitting,
}: CheckoutAddressStepProps) {
  /* ─── Form Setup & Context ─────────────────────────────────────── */
  const {
    register,
    control,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();

  // Watch location fields to trigger fetching dependent data
  const countryId = useWatch({ control, name: "countryId" });
  const regionId = useWatch({ control, name: "regionId" });

  /* ─── Hooks & Translations ─────────────────────────────────────── */
  const t = useTranslations("cart");
  const getTrans = useTrans();

  /* ─── Data Fetching ────────────────────────────────────────────── */
  const { data: countries = [], isLoading: loadingCountries } = useCountries();
  const { data: regions = [], isLoading: loadingRegions } = useRegions(
    countryId || null
  );
  const { data: cities = [], isLoading: loadingCities } = useCities(
    regionId || null
  );

  /* ─── Side Effects ─────────────────────────────────────────────── */
  // Reset downstream locations (Region, City) when upstream locations (Country, Region) change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "countryId") {
        setValue("regionId", "", { shouldValidate: true });
        setValue("cityId", "", { shouldValidate: true });
      }
      if (name === "regionId") {
        setValue("cityId", "", { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  /* ─── Memoized Options (Performance Optimization) ──────────────── */
  // Memoize mapped arrays to prevent unnecessary re-renders of Select components
  const countryOptions = useMemo(() => {
    return countries.map((c: LocationItem) => ({
      value: c._id,
      label: getTrans(c.name),
    }));
  }, [countries, getTrans]);

  const regionOptions = useMemo(() => {
    return regions.map((r: LocationItem) => ({
      value: r._id,
      label: getTrans(r.name),
    }));
  }, [regions, getTrans]);

  const cityOptions = useMemo(() => {
    return cities.map((c: LocationItem) => ({
      value: c._id,
      label: getTrans(c.name),
    }));
  }, [cities, getTrans]);

  /* ─── Handlers ─────────────────────────────────────────────────── */
  const handleContinue = async () => {
    // Validate only the current step's fields before proceeding
    const isValid = await trigger([
      "firstName",
      "lastName",
      "phone",
      "countryId",
      "regionId",
      "cityId",
      "street",
    ]);
    console.log("isValid", isValid);
    if (isValid) {
      onNext();
    }
  };

  /* ─── Render ───────────────────────────────────────────────────── */
  return (
    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/10 rounded-2xl">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t("address.title")}
        </h2>
      </div>

      <div className="space-y-6 pt-2">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              {...register("firstName")}
              label={t("address.first_name")}
              placeholder={t("address.first_name_placeholder")}
              required
              error={errors.firstName?.message}
            />
          </div>
          <div>
            <Input
              {...register("lastName")}
              label={t("address.last_name")}
              placeholder={t("address.last_name_placeholder")}
              required
              error={errors.lastName?.message}
            />
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
            error={errors.phone?.message}
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {t("address.country")}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("countryId")}
            options={countryOptions}
            label={
              loadingCountries
                ? t("address.loading")
                : t("address.select_country")
            }
            disabled={loadingCountries}
            required
            error={errors.countryId?.message}
          />
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {t("address.region")}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("regionId")}
            options={regionOptions}
            label={
              loadingRegions
                ? t("address.loading")
                : t("address.select_region")
            }
            disabled={!countryId || loadingRegions}
            required
            error={errors.regionId?.message}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {t("address.city")}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("cityId")}
            options={cityOptions}
            label={
              loadingCities
                ? t("address.loading")
                : t("address.select_city")
            }
            disabled={!regionId || loadingCities}
            required
            error={errors.cityId?.message}
          />
        </div>

        {/* Street */}
        <div>
          <Input
            {...register("street")}
            label={t("address.street")}
            placeholder={t("address.street_placeholder")}
            required
            error={errors.street?.message}
          />
        </div>

        {/* Building + Postal Row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("building")}
            label={t("address.building")}
            placeholder={t("address.building_placeholder")}
            error={errors.building?.message}
          />
          <Input
            {...register("postalCode")}
            label={t("address.postal_code")}
            placeholder="12345"
            error={errors.postalCode?.message}
          />
        </div>

        {/* Additional Info */}
        <div>
          <Textarea
            {...register("additionalInfo")}
            rows={3}
            label={t("address.additional_info")}
            placeholder={t("address.additional_info_placeholder")}
            error={errors.additionalInfo?.message}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-6 border-t border-border/40">
          <Button
            onClick={handleContinue}
            disabled={isSubmitting}
            size="lg"
            variant={"default"}
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : null}
            {t("address.continue")}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}