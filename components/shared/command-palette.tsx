"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  FilePlus2,
  Globe,
  LayoutDashboard,
  Languages,
  Presentation,
  Settings,
  SquareStack,
  StickyNote,
  Type,
} from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/components/shared/i18n-provider";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useUiStore } from "@/store/ui-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { resolveText } from "@/lib/utils";

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useI18n();
  const { commandOpen, setCommandOpen, boardActions } = useUiStore();
  const boards = useWorkspaceStore((state) => state.boards);
  const templates = useWorkspaceStore((state) => state.templates);
  const createBoard = useWorkspaceStore((state) => state.createBoard);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandOpen, setCommandOpen]);

  const boardResults = useMemo(
    () =>
      boards
        .filter((board) => board.status === "active")
        .slice(0, 8)
        .map((board) => ({
          id: board.id,
          title: resolveText(locale, board.title),
        })),
    [boards, locale],
  );

  const runNavigate = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  const handleCreateBoard = () => {
    const boardId = createBoard({
      title:
        locale === "ar"
          ? { en: "New Board", ar: "لوحة جديدة" }
          : { en: "New Board", ar: "لوحة جديدة" },
      summary:
        locale === "ar"
          ? {
              en: "A fresh workspace surface ready for planning.",
              ar: "سطح عمل جديد جاهز للتخطيط.",
            }
          : {
              en: "A fresh workspace surface ready for planning.",
              ar: "سطح عمل جديد جاهز للتخطيط.",
            },
    });
    setCommandOpen(false);
    router.push(`/boards/${boardId}`);
  };

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title="Command palette"
      description="Search boards, switch views, and launch actions."
    >
      <CommandInput placeholder={locale === "ar" ? "ابحث عن لوحة أو إجراء" : "Search for a board or action"} />
      <CommandList>
        <CommandEmpty>
          {locale === "ar" ? "لا توجد نتائج مطابقة." : "No matching results."}
        </CommandEmpty>
        <CommandGroup heading={locale === "ar" ? "التنقل" : "Navigation"}>
          <CommandItem onSelect={() => runNavigate("/dashboard")}>
            <LayoutDashboard />
            {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runNavigate("/templates")}>
            <SquareStack />
            {locale === "ar" ? "القوالب" : "Templates"}
          </CommandItem>
          <CommandItem onSelect={() => runNavigate("/settings")}>
            <Settings />
            {locale === "ar" ? "الإعدادات" : "Settings"}
          </CommandItem>
          <CommandItem onSelect={() => runNavigate("/pricing")}>
            <Globe />
            {locale === "ar" ? "الأسعار" : "Pricing"}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={locale === "ar" ? "اللوحات" : "Boards"}>
          <CommandItem onSelect={handleCreateBoard}>
            <FilePlus2 />
            {locale === "ar" ? "إنشاء لوحة جديدة" : "Create new board"}
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          {boardResults.map((board) => (
            <CommandItem key={board.id} onSelect={() => runNavigate(`/boards/${board.id}`)}>
              <ArrowRightLeft />
              {board.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={locale === "ar" ? "التفضيلات" : "Preferences"}>
          <CommandItem
            onSelect={() => {
              const next = locale === "en" ? "ar" : "en";
              setLocale(next);
              setCommandOpen(false);
            }}
          >
            <Languages />
            {locale === "ar" ? "التبديل إلى الإنجليزية" : "Switch to Arabic"}
          </CommandItem>
          <CommandItem onSelect={() => runNavigate(pathname)}>
            <Presentation />
            {locale === "ar" ? "إعادة تحميل هذا العرض" : "Refresh this view"}
          </CommandItem>
        </CommandGroup>
        {boardActions ? (
          <>
            <CommandSeparator />
            <CommandGroup heading={locale === "ar" ? "إدراج في اللوحة" : "Insert on board"}>
              <CommandItem
                onSelect={() => {
                  boardActions.createSticky();
                  setCommandOpen(false);
                }}
              >
                <StickyNote />
                {locale === "ar" ? "ملاحظة لاصقة" : "Sticky note"}
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  boardActions.createText();
                  setCommandOpen(false);
                }}
              >
                <Type />
                {locale === "ar" ? "نص" : "Text"}
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  boardActions.createShape("rectangle");
                  setCommandOpen(false);
                }}
              >
                <SquareStack />
                {locale === "ar" ? "مستطيل" : "Rectangle"}
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  boardActions.zoomToFit();
                  setCommandOpen(false);
                }}
              >
                <Presentation />
                {locale === "ar" ? "ملاءمة اللوحة" : "Zoom to fit"}
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading={locale === "ar" ? "القوالب المميزة" : "Featured templates"}>
          {templates.slice(0, 3).map((template) => (
            <CommandItem
              key={template.id}
              onSelect={() => {
                toast.success(
                  locale === "ar"
                    ? `يمكنك تشغيل "${resolveText(locale, template.name)}" من صفحة القوالب.`
                    : `You can launch "${resolveText(locale, template.name)}" from Templates.`,
                );
                setCommandOpen(false);
              }}
            >
              <SquareStack />
              {resolveText(locale, template.name)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
