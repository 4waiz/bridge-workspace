"use client";

import { useState } from "react";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({
  current,
  children,
  search,
  onSearchChange,
}: {
  current: string;
  children: React.ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1800px] lg:grid-cols-[292px_1fr]">
        <aside className="hidden border-r border-border/70 bg-sidebar/90 px-5 py-6 backdrop-blur lg:block">
          <SidebarNav current={current} search={search} onSearchChange={onSearchChange} />
        </aside>
        <div className="flex min-h-screen flex-col">
          <WorkspaceHeader onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="flex-1 px-4 py-6 md:px-6">{children}</div>
        </div>
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[92vw] max-w-sm">
          <SidebarNav current={current} search={search} onSearchChange={onSearchChange} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
