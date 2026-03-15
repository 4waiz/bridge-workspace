"use client";

import { Activity, Mail, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shared/app-shell";
import { ClassificationBadge } from "@/components/shared/classification-badge";
import { useI18n } from "@/components/shared/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceStore } from "@/store/workspace-store";
import { formatRelativeTime, resolveText } from "@/lib/utils";

export default function ProfilePage() {
  const { locale } = useI18n();
  const currentUserId = useWorkspaceStore((state) => state.currentUserId);
  const users = useWorkspaceStore((state) => state.users);
  const boards = useWorkspaceStore((state) => state.boards);
  const activity = useWorkspaceStore((state) => state.activity);

  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0];
  const recentBoards = boards.filter((board) => board.ownerId === currentUser.id).slice(0, 4);
  const recentActivity = activity.filter((entry) => entry.actorId === currentUser.id).slice(0, 4);

  return (
    <AppShell current="profile">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operator profile</CardTitle>
            <CardDescription>Identity and operating responsibility inside the demo workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex size-20 items-center justify-center rounded-[2rem] bg-primary/12 text-2xl font-black text-primary">
              {currentUser.initials}
            </div>
            <div>
              <div className="font-heading text-3xl font-black text-foreground">
                {currentUser.name}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {resolveText(locale, currentUser.role)}
              </div>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-4">
                <Mail className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-4">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Responsible for leadership review and workspace governance.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent boards</CardTitle>
              <CardDescription>Boards currently owned by this operator.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {recentBoards.map((board) => (
                <div
                  key={board.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.7rem] border border-border/70 bg-muted/40 px-4 py-4"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {resolveText(locale, board.title)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {resolveText(locale, board.summary)}
                    </div>
                  </div>
                  <ClassificationBadge classification={board.classification} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest actions performed in the workspace.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-[1.7rem] border border-border/70 bg-muted/40 px-4 py-4"
                >
                  <div className="rounded-2xl bg-card p-3">
                    <Activity className="size-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {resolveText(locale, entry.action)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatRelativeTime(entry.createdAt, locale)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
