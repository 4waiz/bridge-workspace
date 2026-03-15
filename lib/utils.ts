import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

import { classificationPalette } from "@/lib/theme/tokens";
import type { ClassificationLevel, Locale, LocalizedText } from "@/types/app";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "ar";
}

export function isRtlLocale(locale: Locale) {
  return locale === "ar";
}

export function resolveText(locale: Locale, value: LocalizedText) {
  return value[locale];
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function formatRelativeTime(date: string, locale: Locale) {
  const result = formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
  });

  if (locale === "en") {
    return result;
  }

  return result
    .replace("seconds ago", "منذ ثوان")
    .replace("second ago", "منذ ثانية")
    .replace("minutes ago", "منذ دقائق")
    .replace("minute ago", "منذ دقيقة")
    .replace("hours ago", "منذ ساعات")
    .replace("hour ago", "منذ ساعة")
    .replace("days ago", "منذ أيام")
    .replace("day ago", "منذ يوم")
    .replace("months ago", "منذ أشهر")
    .replace("month ago", "منذ شهر");
}

export function formatDate(date: string, locale: Locale) {
  return format(new Date(date), locale === "ar" ? "dd/MM/yyyy" : "MMM d, yyyy");
}

export function setClientCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function classificationTone(level: ClassificationLevel) {
  return classificationPalette[level];
}

export function groupByMonth(date: string) {
  return format(new Date(date), "MMMM yyyy");
}
