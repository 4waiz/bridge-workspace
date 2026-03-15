"use client";

import Link from "next/link";
import { Bell, CircleHelp, Menu, Plus, UsersRound } from "lucide-react";

import { CollaboratorStack } from "@/components/shared/collaborator-stack";
import { useI18n } from "@/components/shared/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";

export function WorkspaceHeader({
  onOpenSidebar,
}: {
  onOpenSidebar?: () => void;
}) {
  const { messages, locale } = useI18n();
  const workspace = useWorkspaceStore((state) => state.workspace);
  const users = useWorkspaceStore((state) => state.users);
  const currentUserId = useWorkspaceStore((state) => state.currentUserId);
  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="size-4" />
        </Button>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {messages.common.workspace}
          </div>
          <div className="font-heading text-xl font-bold text-foreground">
            {workspace.name[locale]}
          </div>
        </div>
        <Badge>{workspace.plan[locale]}</Badge>
      </div>
      <div className="flex items-center gap-3">
        <CollaboratorStack users={users.slice(1, 5)} />
        <Button className="rounded-full">
          <UsersRound className="size-4" />
          {messages.common.inviteMembers}
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="size-4" />
        </Button>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/templates">
            <Plus className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <CircleHelp className="size-4" />
        </Button>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary">
          {currentUser.initials}
        </div>
      </div>
    </div>
  );
}
