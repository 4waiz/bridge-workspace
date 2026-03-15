"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { messages, type MessageCatalog } from "@/lib/i18n/messages";
import { isRtlLocale, setClientCookie } from "@/lib/utils";
import type { Locale } from "@/types/app";

type I18nContextValue = {
  locale: Locale;
  isRtl: boolean;
  direction: "ltr" | "rtl";
  messages: MessageCatalog;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return initialLocale;
    }
    const stored = window.localStorage.getItem("edge-locale");
    return stored === "en" || stored === "ar" ? stored : initialLocale;
  });

  useEffect(() => {
    const direction = isRtlLocale(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    window.localStorage.setItem("edge-locale", locale);
    setClientCookie("edge-locale", locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const isRtl = isRtlLocale(locale);
    return {
      locale,
      isRtl,
      direction: isRtl ? "rtl" : "ltr",
      messages: messages[locale],
      setLocale: setLocaleState,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
