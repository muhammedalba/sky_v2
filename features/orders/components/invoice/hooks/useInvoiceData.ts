import { useMemo } from "react";
import { Order } from "@/features/orders/types";
import { LocalizedString } from "@/types";
import { SettingsInput } from "@/features/settings/settings.schema";
import { FileAsset } from "@/shared/types/file-asset";
import { useTrans } from "@/shared/hooks/useTrans";
import {
  getLocalizedValue,
  getLocationName,
  numberToArabicWords,
} from "../utils/invoiceUtils";

export interface InvoiceCalculatedData {
  subtotal: number;
  shipping: number;
  paymentFees: number;
  discount: number;
  taxableSubtotal: number;
  tax: number;
  grandTotal: number;
  orderYear: number;
  userVat: string;
  customerCountry: string;
  customerCity: string;
  arabicAmountWords: string;
  siteNameAr: string;
  siteNameEn: string;
  siteLogo: FileAsset | string;
  crNo: string;
  vatNo: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  email: string;
  phone: string;
  companyCountryAr: string;
  companyCountryEn: string;
  companyCityAr: string;
  companyCityEn: string;
  companyAreaAr: string;
  companyAreaEn: string;
  companyStreetAr: string;
  companyStreetEn: string;
  mailBox: string;
  poBox: string;
}

export function useInvoiceData(
  order: Order | null,
  settings: Partial<SettingsInput> | null | undefined,
): InvoiceCalculatedData | null {
  const getTrans = useTrans();

  return useMemo(() => {
    if (!order) return null;

    const subtotal = order.totalPrice || 0;
    const shipping = order.shippingAmount || 0;
    const discount = order.discountAmount || 0;
    const taxableSubtotal = subtotal - discount;
    const tax = order.taxAmount || taxableSubtotal * 0.15;
    const grandTotal = order.grandTotal || taxableSubtotal + tax + shipping;
    const orderYear = order.createdAt
      ? new Date(order.createdAt).getFullYear()
      : 2026;
    const userVat = order.shippingAddress?.vendorVatNo || "N/A";

    const customerCountry =
      getLocationName(order.shippingAddress?.country, "ar") ||
      getTrans(order.shippingAddress?.country as unknown as LocalizedString | undefined) ||
      "المملكة العربية السعودية";
    const customerCity =
      getLocationName(order.shippingAddress?.city, "ar") ||
      getTrans(order.shippingAddress?.city as unknown as LocalizedString | undefined) ||
      "-";

    const arabicAmountWords = numberToArabicWords(grandTotal);

    // Dynamic Store Settings
    const siteNameAr = getLocalizedValue(settings?.siteName, "ar") || "متجري";
    const siteNameEn =
      getLocalizedValue(settings?.siteName, "en") || "My Store";
    const siteLogo = settings?.logo || "/assets/images/auth-logo.webp";
    const crNo = settings?.businessAddress?.crNo || "-";
    const vatNo = settings?.businessAddress?.vatNo || "-";

    const bankName = settings?.bankTransferDetails?.bankName || "-";
    const accountName = settings?.bankTransferDetails?.accountName || "-";
    const accountNumber = settings?.bankTransferDetails?.accountNumber || "-";
    const iban = settings?.bankTransferDetails?.iban || "-";

    const email = settings?.contactInfo?.email || "";
    const phone = settings?.contactInfo?.phones?.[0] || "";

    const companyCountryAr =
      getLocalizedValue(settings?.businessAddress?.country, "ar") ||
      "المملكة العربية السعودية";
    const companyCountryEn =
      getLocalizedValue(settings?.businessAddress?.country, "en") ||
      "Saudi Arabia";
    const companyCityAr =
      getLocalizedValue(settings?.businessAddress?.city, "ar") || "-";
    const companyCityEn =
      getLocalizedValue(settings?.businessAddress?.city, "en") || "-";
    const companyAreaAr =
      getLocalizedValue(settings?.businessAddress?.area, "ar") || "-";
    const companyAreaEn =
      getLocalizedValue(settings?.businessAddress?.area, "en") || "-";
    const companyStreetAr =
      getLocalizedValue(settings?.businessAddress?.street, "ar") || "-";
    const companyStreetEn =
      getLocalizedValue(settings?.businessAddress?.street, "en") || "-";
    const mailBox = settings?.businessAddress?.mailBox || "-";
    const poBox = settings?.businessAddress?.poBox || "-";
    const paymentFees = order.paymentFees || 0;

    return {
      subtotal,
      shipping,
      paymentFees,
      discount,
      taxableSubtotal,
      tax,
      grandTotal,
      orderYear,
      userVat,
      customerCountry,
      customerCity,
      arabicAmountWords,
      siteNameAr,
      siteNameEn,
      siteLogo,
      crNo,
      vatNo,
      bankName,
      accountName,
      accountNumber,
      iban,
      email,
      phone,
      companyCountryAr,
      companyCountryEn,
      companyCityAr,
      companyCityEn,
      companyAreaAr,
      companyAreaEn,
      companyStreetAr,
      companyStreetEn,
      mailBox,
      poBox,
    };
  }, [order, settings, getTrans]);
}
