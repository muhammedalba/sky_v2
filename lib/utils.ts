import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS classes dynamically, resolving conflicts.
 * Uses `clsx` to construct class names conditionally and `twMerge` to merge them cleanly.
 *
 * @param inputs - Array of class values (strings, objects, arrays, etc.) to merge.
 * @returns A single unified string of Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Re-exported for backward compatibility — the implementation now lives in
 * `@/lib/currency` alongside `getCurrencyParts`, the shared conversion/symbol
 * resolution logic also used by the `<Price>` component.
 */
export { formatCurrency } from "./currency";

/**
 * Formats a date object or string to display only year, month, and day.
 *
 * @param date - The Date object or string to format.
 * @param locale - Format locale (defaults to "en-US").
 * @returns Formatted date string (e.g., "May 22, 2026") or "-" if date is invalid.
 */
export function formatDate(
  date: string | Date,
  locale: string = "en-US",
  month: "numeric" | "2-digit" | "narrow" | "short" | "long" = "short",
): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: month,
    day: "numeric",
  }).format(d);
}

/**
 * Formats a date object or string to show both date and time (hour/minute).
 *
 * @param date - The Date object or string to format.
 * @param locale - Format locale (defaults to "en-US").
 * @returns Formatted datetime string (e.g., "May 22, 2026, 04:30 PM") or "-" if date is invalid.
 */
export function formatDateTime(
  date: string | Date,
  locale: string = "en-US",
): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formats a date into a smart relative time string (e.g. "just now", "Today, 10:30 AM", "Yesterday, 09:15 PM").
 *
 * @param date - The target Date object or date string.
 * @param locale - Format locale (defaults to "ar-SA").
 * @returns Localized relative time string, or a fully formatted date if older than yesterday.
 */
export function formatRelativeTime(
  date: string | Date,
  locale: string = "ar-SA",
): string {
  if (!date) return "-";
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return locale.startsWith("ar") ? "الآن" : "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
    return rtf.format(-diffInMinutes, "minute");
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24 && now.getDate() === d.getDate()) {
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
    return locale.startsWith("ar") ? `اليوم، ${time}` : `Today, ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) {
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
    return locale.startsWith("ar") ? `أمس، ${time}` : `Yesterday, ${time}`;
  }

  return formatDateTime(date, locale);
}

/**
 * Gets Tailwind utility color classes for an order or item status badge.
 *
 * @param status - The status keyword (e.g. "pending", "delivered", "cancelled").
 * @returns Class string combining background and text color utility classes.
 *
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending_payment: "bg-amber-500/10 text-amber-600",
    pending: "bg-orange-500/10 text-orange-400",
    processing: "bg-blue-500/10 text-blue-600",
    shipped: "bg-indigo-500/10 text-indigo-600",
    delivered: "bg-teal-500/10 text-teal-600",
    completed: "bg-emerald-500/10 text-emerald-600",
    cancelled: "bg-red-500/10 text-red-600",
    expired: "bg-gray-500/10 text-gray-600",
  };
  return statusColors[status.toLowerCase()] || "bg-muted text-muted-foreground";
}

/**
 * Gets Tailwind utility color classes for a payment status badge.
 *
 * @param status - The payment status keyword (e.g. "PENDING", "PAID", "CANCELLED").
 * @returns Class string combining background and text color utility classes.
 */
export function getPaymentStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    INITIATED: "bg-sky-500/10 text-sky-600 ",
    PENDING: "bg-amber-500/10 text-amber-600",
    PAID: "bg-success/10 text-success",
    FAILED: "bg-red-500/10 text-red-600",
    CANCELLED: "bg-red-500/10 text-red-600",
    REFUNDED: "bg-purple-500/10 text-purple-600",
    EXPIRED: "bg-gray-500/10 text-gray-600",
  };
  return statusColors[status.toUpperCase()] || "bg-muted text-muted-foreground";
}

/**
 * Truncates long strings to a specified maximum length, appending an ellipsis (...).
 *
 * @param str - The source string.
 * @param length - Maximum length before truncation.
 * @returns Truncated string or original string if short enough.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Extracts the appropriate translation value from a multi-language object or handles plain values.
 * Supports fallback mechanisms if the requested locale translation is missing.
 *
 * @template T - The type of value expected.
 * @param value - The multi-lingual dictionary (e.g. `{ ar: "...", en: "..." }`) or a direct value.
 * @param locale - Desired language locale string.
 * @returns The translation string or value corresponding to the locale, or falls back to ar/en/first available key.
 */
export function getLocalizedValue<T>(
  value: T | { [key: string]: T } | unknown,
  locale: string,
): T {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const valObj = value as Record<string, T>;
    return (
      valObj[locale] || valObj["ar"] || valObj["en"] || Object.values(valObj)[0]
    );
  }
  return value as T;
}

/**
 * Determines the Badge UI component style variant based on the user's role permission level.
 *
 * @param level - Permission rank number (e.g., 90 for SuperAdmin).
 * @returns Compatible Badge variant name ("success", "destructive", "warning", or "secondary").
 */
export function getRoleBadgeVariant(
  level: number,
): "default" | "secondary" | "destructive" | "warning" | "success" {
  if (level >= 90) return "success"; // SuperAdmin
  if (level >= 50) return "destructive"; // Admin
  if (level >= 30) return "warning"; // Manager
  return "secondary"; // Regular User
}

/**
 * Helper to strip the "@gmail.com" suffix from email strings for clean alias display.
 *
 * @param email - User's email string.
 * @returns E-mail name prefix without domain, or empty string.
 */
export function formatEmail(email?: string | null): string {
  if (!email) return "";
  return email.replace(/gmail\.com$/i, "");
}

/**
 * Maps notification action events to the appropriate UI Badge component style variant.
 *
 * @param action - Action event type name (e.g., "SYSTEM_UPDATE").
 * @returns The badge styling variant.
 */
export function getActionBadgeVariant(
  action?: string | null,
):
  | "default"
  | "secondary"
  | "destructive"
  | "danger"
  | "success"
  | "warning"
  | "outline" {
  if (!action) return "outline";
  switch (action.toUpperCase()) {
    case "GENERAL":
      return "secondary";
    case "SYSTEM_UPDATE":
      return "default";
    case "ADMIN_ALERT":
      return "destructive";
    case "PROMOTION":
      return "success";
    case "ORDER_UPDATE":
      return "default";
    case "SPECIAL_OFFER":
      return "success";
    default:
      return "outline";
  }
}

/**
 * Formats an order's public-facing number for display, e.g. "0001".
 * Prefers the sequential `invoiceNumber`, falling back to the last chars of `_id`.
 *
 * @param order - Object with an `_id` and optional `invoiceNumber`.
 * @param idLength - Number of trailing `_id` characters to use as fallback (default 6).
 * @returns Zero-padded, uppercase order number string (without the leading "#").
 */
export function formatOrderNumber(
  order: { _id: string; invoiceNumber?: number | null },
  idLength: number = 6,
): string {
  const source = order.invoiceNumber ?? order._id.slice(-idLength);
  return String(source).toUpperCase().padStart(4, "0");
}
