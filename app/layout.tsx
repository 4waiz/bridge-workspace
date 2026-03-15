import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Manrope, Noto_Sans_Arabic } from "next/font/google";

import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site";
import { isLocale, isRtlLocale } from "@/lib/utils";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("edge-locale")?.value;
  const locale = isLocale(localeCookie) ? localeCookie : "en";
  const direction = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      dir={direction}
      lang={locale}
      suppressHydrationWarning
      className="overflow-x-hidden"
    >
      <body
        className={`${inter.variable} ${manrope.variable} ${notoSansArabic.variable} bg-background font-sans text-foreground antialiased`}
      >
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
