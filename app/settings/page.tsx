"use client";

import { useTheme } from "next-themes";
import { CreditCard, Keyboard, Shield, Users } from "lucide-react";

import { AppShell } from "@/components/shared/app-shell";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useWorkspaceStore } from "@/store/workspace-store";

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const preferences = useWorkspaceStore((state) => state.preferences);
  const setThemeMode = useWorkspaceStore((state) => state.setThemeMode);
  const setBoardDensity = useWorkspaceStore((state) => state.setBoardDensity);
  const setBoardDefaults = useWorkspaceStore((state) => state.setBoardDefaults);
  const setNotificationPreference = useWorkspaceStore((state) => state.setNotificationPreference);
  const resetDemoState = useWorkspaceStore((state) => state.resetDemoState);

  return (
    <AppShell current="settings">
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Control surface
          </div>
          <h1 className="mt-2 font-heading text-4xl font-black text-foreground">
            Workspace settings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Tune the demo environment, board defaults, notifications, language behavior, and readiness for a future backend integration.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile and workspace</CardTitle>
              <CardDescription>Adjust the baseline experience for the current demo team.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-4">
                <div>
                  <div className="font-semibold text-foreground">Language</div>
                  <div className="text-sm text-muted-foreground">Persisted locally across the app shell.</div>
                </div>
                <LanguageToggle />
              </div>
              <div className="grid gap-2">
                <div className="font-semibold text-foreground">Appearance</div>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => {
                    const next = value as "light" | "dark" | "system";
                    setThemeMode(next);
                    setTheme(next);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="font-semibold text-foreground">Board density</div>
                <Select value={preferences.boardDensity} onValueChange={(value) => setBoardDensity(value as "comfortable" | "compact")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Board density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Board defaults</CardTitle>
              <CardDescription>Set the default classification and visibility for newly created boards.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <div className="font-semibold text-foreground">Default classification</div>
                <Select
                  value={preferences.boardDefaults.classification}
                  onValueChange={(value) =>
                    setBoardDefaults({
                      ...preferences.boardDefaults,
                      classification: value as "public" | "internal" | "restricted",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="font-semibold text-foreground">Default visibility</div>
                <Select
                  value={preferences.boardDefaults.visibility}
                  onValueChange={(value) =>
                    setBoardDefaults({
                      ...preferences.boardDefaults,
                      visibility: value as "private" | "workspace" | "shared",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                Security badges are reflected on dashboard cards, board headers, and the export surface.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control which local demo signals remain visible in the shell.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {Object.entries(preferences.notifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-4"
                >
                  <div>
                    <div className="font-semibold text-foreground capitalize">{key}</div>
                    <div className="text-sm text-muted-foreground">
                      Keep {key} visible in the workspace header and activity feed.
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotificationPreference(
                        key as keyof typeof preferences.notifications,
                        checked,
                      )
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keyboard and operators</CardTitle>
              <CardDescription>Key shortcuts and supporting surfaces for power users.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { icon: Keyboard, label: "Command palette", shortcut: "Ctrl/Cmd + K" },
                { icon: Shield, label: "Presentation mode", shortcut: "Header action" },
                { icon: CreditCard, label: "Billing placeholder", shortcut: "Planned" },
                { icon: Users, label: "Team management placeholder", shortcut: "Planned" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-card p-3">
                      <item.icon className="size-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.shortcut}</div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="mt-2" onClick={resetDemoState}>
                Reset demo workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
