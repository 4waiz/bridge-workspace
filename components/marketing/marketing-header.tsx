"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, PhoneCall } from "lucide-react";

import { MegaMenu } from "@/components/marketing/mega-menu";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { Logo } from "@/components/shared/logo";
import { useI18n } from "@/components/shared/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navMegaMenus } from "@/lib/mock-data/marketing-content";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const { messages } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"solutions" | "media" | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { label: messages.nav.about, href: "#about" },
      { label: messages.nav.solutions, href: "#solutions", menu: "solutions" as const },
      { label: messages.nav.entities, href: "#entities" },
      { label: messages.nav.media, href: "#media", menu: "media" as const },
      { label: messages.nav.careers, href: "#careers" },
      { label: messages.nav.eVendor, href: "#vendor" },
      { label: messages.nav.pricing, href: "/pricing" },
    ],
    [messages.nav],
  );

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 md:px-6">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-border/70 bg-card/88 px-4 transition-all duration-300 backdrop-blur-xl md:px-6",
          scrolled ? "py-3 shadow-[var(--shadow-sm)]" : "py-4",
        )}
      >
        <Link href="/" className="shrink-0">
          <Logo size={scrolled ? "sm" : "md"} />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.menu && setActiveMenu(item.menu)}
              onMouseLeave={() => item.menu && setActiveMenu(null)}
            >
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-foreground/90 transition-colors hover:text-primary"
              >
                {item.label}
                {item.menu ? <ChevronDown className="size-4" /> : null}
              </Link>
              {item.menu ? (
                <MegaMenu
                  open={activeMenu === item.menu}
                  items={navMegaMenus[item.menu]}
                />
              ) : null}
            </div>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" className="rounded-full">
            <PhoneCall className="size-4" />
            {messages.common.contactSales}
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/login">{messages.common.login}</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/signup">{messages.common.signup}</Link>
          </Button>
          <LanguageToggle />
        </div>
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[92vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>
                  <Logo compact />
                </SheetTitle>
                <SheetDescription>
                  Navigate the marketing site and open the demo workspace.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-8 grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                <LanguageToggle className="justify-between" />
                <Button asChild variant="outline">
                  <Link href="/login">{messages.common.login}</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">{messages.common.signup}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
