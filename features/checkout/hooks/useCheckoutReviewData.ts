import { useMemo } from "react";
import { useWatch, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Country, City } from "@/features/locations/types";
import { ActivePaymentMethod } from "@/features/checkout/constants/paymentMethods";

export function useCheckoutReviewData<T extends FieldValues>({
  form,
  countries,
  cities,
  shippingOptions,
  paymentMethods,
  getTrans,
  selectedShippingId,
  selectedPaymentId,
}: {
  form: UseFormReturn<T>;
  countries: Country[];
  cities: City[];
  shippingOptions: { providerId?: string; providerName?: string; supportsCOD?: boolean; [key: string]: unknown }[];
  paymentMethods: ActivePaymentMethod[];
  getTrans: (text: { ar: string; en: string; } | string | undefined | null) => string;
  selectedShippingId: string;
  selectedPaymentId: string;
}) {
  const regionId = useWatch({ control: form.control, name: "regionId" as Path<T> }) as string;
  const countryId = useWatch({ control: form.control, name: "countryId" as Path<T> }) as string;
  const cityId = useWatch({ control: form.control, name: "cityId" as Path<T> }) as string;

  const selectedCountry = useMemo(
    () => countries.find((c) => c._id === countryId),
    [countries, countryId]
  );

  const selectedCity = useMemo(
    () => cities.find((c) => c._id === cityId),
    [cities, cityId]
  );

  const selectedCountryName = useMemo(
    () => getTrans(selectedCountry?.name),
    [getTrans, selectedCountry?.name]
  );

  const selectedCityName = useMemo(
    () => getTrans(selectedCity?.name),
    [getTrans, selectedCity?.name]
  );

  const selectedShippingOption = useMemo(
    () => shippingOptions.find((opt: { providerId?: string }) => opt.providerId === selectedShippingId),
    [shippingOptions, selectedShippingId]
  );

  const selectedPayment = useMemo(
    () => paymentMethods.find((m: { _id: string }) => m._id === selectedPaymentId),
    [paymentMethods, selectedPaymentId]
  );

  const isCODSupportedByCarrier = selectedShippingOption?.supportsCOD ?? false;

  return {
    regionId,
    selectedCityName,
    selectedCountryName,
    selectedShippingOption,
    selectedPayment,
    isCODSupportedByCarrier,
  };
}
