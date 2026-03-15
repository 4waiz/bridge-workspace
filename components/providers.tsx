"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { CommandPalette } from "@/components/shared/command-palette";
import { I18nProvider, useI18n } from "@/components/shared/i18n-provider";
import type { Locale } from "@/types/app";

function LocalizedToaster() {
  const { isRtl } = useI18n();

  return <Toaster richColors position={isRtl ? "top-left" : "top-right"} />;
}

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={initialLocale}>
        {children}
        <CommandPalette />
        <LocalizedToaster />
      </I18nProvider>
    </ThemeProvider>
  );
}
