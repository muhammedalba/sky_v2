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

interface CheckoutAddressStepProps {
  isAr: boolean;
  onNext: () => void;
  isSubmitting: boolean;
}

export function CheckoutAddressStep({
  isAr,
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
        <h2 className="text-xl font-black text-foreground">
          {isAr ? "عنوان التوصيل" : "Delivery Address"}
        </h2>
      </div>

      <div className="space-y-6 pt-2">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label={isAr ? "الاسم الأول" : "First Name"}
              placeholder={isAr ? "محمد" : "John"}
              {...register("firstName")}
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
              label={isAr ? "اسم العائلة" : "Last Name"}
              placeholder={isAr ? "أحمد" : "Doe"}
              {...register("lastName")}
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
            label={isAr ? "رقم الهاتف" : "Phone Number"}
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
            {isAr ? "الدولة" : "Country"}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("countryId")}
            options={countries.map((c: any) => ({
              value: c._id,
              label: isAr ? c.name?.ar || c.name : c.name?.en || c.name,
            }))}
            label={
              loadingCountries
                ? isAr
                  ? "جارٍ التحميل..."
                  : "Loading..."
                : isAr
                  ? "اختر الدولة"
                  : "Select country"
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
            {isAr ? "المنطقة" : "Region"}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("regionId")}
            options={regions.map((r: any) => ({
              value: r._id,
              label: isAr ? r.name?.ar || r.name : r.name?.en || r.name,
            }))}
            label={
              loadingRegions
                ? isAr
                  ? "جارٍ التحميل..."
                  : "Loading..."
                : isAr
                  ? "اختر المنطقة"
                  : "Select region"
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
            {isAr ? "المدينة" : "City"}
            <span className="text-destructive">*</span>
          </label>
          <Select
            {...register("cityId")}
            options={cities.map((c: any) => ({
              value: c._id,
              label: isAr ? c.name?.ar || c.name : c.name?.en || c.name,
            }))}
            label={
              loadingCities
                ? isAr
                  ? "جارٍ التحميل..."
                  : "Loading..."
                : isAr
                  ? "اختر المدينة"
                  : "Select city"
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
            label={isAr ? "الشارع" : "Street"}
            placeholder={isAr ? "اسم الشارع والرقم" : "Street name and number"}
            {...register("street")}
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
            label={isAr ? "المبنى / الشقة" : "Building / Apt"}
            placeholder={isAr ? "٢أ" : "2A"}
            {...register("building")}
          />
          <Input
            label={isAr ? "الرمز البريدي" : "Postal Code"}
            placeholder="12345"
            {...register("postalCode")}
          />
        </div>

        {/* Additional Info */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            {isAr ? "معلومات إضافية (اختياري)" : "Additional Info (Optional)"}
          </label>
          <textarea
            {...register("additionalInfo")}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
            placeholder={
              isAr ? "علامة مميزة، وقت التوصيل المفضل..." : "Landmark, preferred time..."
            }
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
            {isAr ? "متابعة" : "Continue"}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
