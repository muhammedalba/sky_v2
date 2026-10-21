import { useMemo } from "react";
import { Order } from "@/features/orders/types";
import { SettingsInput } from "@/features/settings/settings.schema";
import { FileAsset } from "@/shared/types/file-asset";
import { getLocalizedValue } from "@/lib/utils";
import { getLocationName } from "../utils/invoiceUtils";
import { amountToArabicWords } from "../utils/arabicAmountWords";

export interface InvoiceCalculatedData {
  subtotal: number;
  shipping: number;
  paymentFees: number;
  discount: number;
  taxableSubtotal: number;
  /** Undefined for orders placed before the backend stored these values. */
  productsBeforeTax?: number;
  productsAfterTax?: number;
  tax: number;
  grandTotal: number;
  orderYear: number;
  userVat: string;
  customerCountry: string;
  customerCity: string;
  customerRegion: string;
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
  return useMemo(() => {
    if (!order) return null;

    const subtotal = order.totalPrice || 0;
    const shipping = order.shippingAmount || 0;
    const discount = order.discountAmount || 0;
    const paymentFees = order.paymentFees || 0;
    const netBeforeTax = subtotal - discount + shipping + paymentFees;
    const tax = order.taxAmount || netBeforeTax * 0.15;
    const grandTotal = order.grandTotal || netBeforeTax + tax;
    // Total excluding VAT; derived from stored totals so tax-inclusive prices are handled too
    const taxableSubtotal =
      order.grandTotal && order.taxAmount
        ? order.grandTotal - order.taxAmount
        : netBeforeTax;
    const orderYear = order.createdAt
      ? new Date(order.createdAt).getFullYear()
      : 2026;
    const userVat = order.shippingAddress?.vendorVatNo || "N/A";

    const customerCountry =
      getLocationName(order.shippingAddress?.country, "ar") ||
      "المملكة العربية السعودية";
    const customerCity =
      getLocationName(order.shippingAddress?.city, "ar") || "-";
    const customerRegion =
      getLocationName(order.shippingAddress?.region, "ar") || "-";

    // The order's currency is the store's at checkout; settings cover old orders
    const arabicAmountWords = amountToArabicWords(
      grandTotal,
      order.currency || settings?.currencyCode,
    );

    // Dynamic Store Settings
    // Legal company name takes priority on invoices; display name is the fallback
    const siteNameAr =
      getLocalizedValue<string>(settings?.legalName, "ar") ||
      getLocalizedValue<string>(settings?.siteName, "ar") ||
      "متجري";
    const siteNameEn =
      getLocalizedValue<string>(settings?.legalName, "en") ||
      getLocalizedValue<string>(settings?.siteName, "en") ||
      "My Store";
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
      getLocalizedValue<string>(settings?.businessAddress?.country, "ar") ||
      "المملكة العربية السعودية";
    const companyCountryEn =
      getLocalizedValue<string>(settings?.businessAddress?.country, "en") ||
      "Saudi Arabia";
    const companyCityAr =
      getLocalizedValue<string>(settings?.businessAddress?.city, "ar") || "-";
    const companyCityEn =
      getLocalizedValue<string>(settings?.businessAddress?.city, "en") || "-";
    const companyAreaAr =
      getLocalizedValue<string>(settings?.businessAddress?.area, "ar") || "-";
    const companyAreaEn =
      getLocalizedValue<string>(settings?.businessAddress?.area, "en") || "-";
    const companyStreetAr =
      getLocalizedValue<string>(settings?.businessAddress?.street, "ar") || "-";
    const companyStreetEn =
      getLocalizedValue<string>(settings?.businessAddress?.street, "en") || "-";
    const mailBox = settings?.businessAddress?.mailBox || "-";
    const poBox = settings?.businessAddress?.poBox || "-";

    return {
      subtotal,
      shipping,
      paymentFees,
      discount,
      taxableSubtotal,
      productsBeforeTax: order.productsAmountBeforeTax,
      productsAfterTax: order.productsAmountAfterTax,
      tax,
      grandTotal,
      orderYear,
      userVat,
      customerCountry,
      customerCity,
      customerRegion,
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
  }, [order, settings]);
}
