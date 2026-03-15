import { subDays, subHours } from "date-fns";

import type {
  ActivityItem,
  Board,
  ClassificationLevel,
  LocalizedText,
  Template,
  TemplateCategory,
  User,
  WorkspaceSeed,
} from "@/types/app";

const t = (en: string, ar: string): LocalizedText => ({ en, ar });

const template = (
  id: string,
  category: TemplateCategory,
  name: LocalizedText,
  description: LocalizedText,
  structure: string[],
  tags: LocalizedText[],
  useCases: LocalizedText[],
  featured = false,
): Template => ({
  id,
  category,
  name,
  description,
  structure,
  tags,
  useCases,
  featured,
});

const now = new Date();

const users: User[] = [
  {
    id: "user-awaiz",
    name: "Awaiz Rahman",
    role: t("Executive Sponsor", "الراعي التنفيذي"),
    email: "awaiz@edge.local",
    initials: "AR",
    color: "#E36436",
  },
  {
    id: "user-noura",
    name: "Noura Saeed",
    role: t("Strategy Director", "مديرة الاستراتيجية"),
    email: "noura@edge.local",
    initials: "NS",
    color: "#0F766E",
  },
  {
    id: "user-omar",
    name: "Omar Hamdan",
    role: t("Program Lead", "قائد البرنامج"),
    email: "omar@edge.local",
    initials: "OH",
    color: "#C2410C",
  },
  {
    id: "user-dalia",
    name: "Dalia Farouk",
    role: t("Delivery Manager", "مديرة التسليم"),
    email: "dalia@edge.local",
    initials: "DF",
    color: "#64748B",
  },
  {
    id: "user-khalid",
    name: "Khalid Mansour",
    role: t("Enterprise Architect", "معماري المؤسسة"),
    email: "khalid@edge.local",
    initials: "KM",
    color: "#9333EA",
  },
  {
    id: "user-salma",
    name: "Salma Noor",
    role: t("Operations Analyst", "محللة العمليات"),
    email: "salma@edge.local",
    initials: "SN",
    color: "#2563EB",
  },
];

export const templates: Template[] = [
  template(
    "template-strategy-sprint",
    "strategy",
    t("Strategy Sprint Canvas", "لوحة سباق الاستراتيجية"),
    t(
      "Frame the objective, options, tradeoffs, and decision path for executive alignment.",
      "هيكل الهدف والخيارات والمفاضلات ومسار القرار لمواءمة القيادة.",
    ),
    ["North star", "Decision lanes", "Dependencies", "Owner map"],
    [t("Strategy", "استراتيجية"), t("Executive", "تنفيذي")],
    [
      t("Annual planning", "التخطيط السنوي"),
      t("Steering committee reviews", "مراجعات اللجنة التوجيهية"),
    ],
    true,
  ),
  template(
    "template-roadmap-q3",
    "delivery",
    t("Program Roadmap", "خارطة البرنامج"),
    t(
      "Coordinate milestones, risks, sequencing, and dependencies across a complex delivery portfolio.",
      "تنسيق المراحل والمخاطر والتسلسل والاعتماديات عبر محفظة تسليم معقدة.",
    ),
    ["Objectives", "Milestones", "Risks", "Owners"],
    [t("Roadmap", "خارطة"), t("Delivery", "تسليم")],
    [
      t("Quarterly execution", "تنفيذ ربع سنوي"),
      t("PMO governance", "حوكمة مكتب إدارة المشاريع"),
    ],
    true,
  ),
  template(
    "template-engineering-plan",
    "engineering",
    t("Engineering Planning", "تخطيط الهندسة"),
    t(
      "Translate priorities into squads, sequence, capacity, and technical assumptions.",
      "حوّل الأولويات إلى فرق وتسلسل وسعة وافتراضات تقنية.",
    ),
    ["Squads", "Backlog blocks", "Dependencies", "Release gates"],
    [t("Engineering", "الهندسة"), t("Capacity", "السعة")],
    [
      t("Release planning", "تخطيط الإطلاق"),
      t("Architecture reviews", "مراجعات المعمارية"),
    ],
  ),
  template(
    "template-risk-register",
    "operations",
    t("Risk Register", "سجل المخاطر"),
    t(
      "Track probability, impact, mitigation, ownership, and escalation paths in one operating view.",
      "تابع الاحتمال والأثر والتخفيف والملكية ومسارات التصعيد في عرض تشغيلي واحد.",
    ),
    ["Risk lanes", "Severity scale", "Mitigations", "Decision log"],
    [t("Risk", "المخاطر"), t("Governance", "الحوكمة")],
    [
      t("Audit preparation", "الاستعداد للتدقيق"),
      t("Executive risk review", "مراجعة المخاطر التنفيذية"),
    ],
  ),
  template(
    "template-exec-review",
    "executive",
    t("Executive Review", "المراجعة التنفيذية"),
    t(
      "Summarize signal, decisions, blockers, owners, and next steps for leadership cadence.",
      "لخّص المؤشرات والقرارات والعوائق والمسؤولين والخطوات التالية لإيقاع القيادة.",
    ),
    ["Headline", "Decision board", "Risks", "Next actions"],
    [t("Leadership", "القيادة"), t("Review", "مراجعة")],
    [
      t("Weekly business review", "المراجعة الأسبوعية للأعمال"),
      t("Portfolio governance", "حوكمة المحفظة"),
    ],
    true,
  ),
  template(
    "template-discovery",
    "workshops",
    t("Product Discovery Lab", "مختبر اكتشاف المنتج"),
    t(
      "Capture opportunity areas, research signals, solution paths, and decision criteria.",
      "التقط مجالات الفرص وإشارات البحث ومسارات الحل ومعايير القرار.",
    ),
    ["Research inputs", "Insight board", "Hypotheses", "Priorities"],
    [t("Discovery", "الاكتشاف"), t("Workshop", "ورشة")],
    [
      t("Discovery workshops", "ورش الاكتشاف"),
      t("Problem framing", "صياغة المشكلة"),
    ],
  ),
];

const baseComments = {
  note1: t(
    "Align legal review before sharing externally.",
    "نسّق المراجعة القانونية قبل المشاركة الخارجية.",
  ),
  note2: t(
    "Need owner confirmation on the mitigation lane.",
    "نحتاج تأكيد المسؤول في مسار التخفيف.",
  ),
};

function boardSeed(
  id: string,
  title: LocalizedText,
  summary: LocalizedText,
  ownerId: string,
  collaboratorIds: string[],
  classification: ClassificationLevel,
  visibility: Board["visibility"],
  templateId: string | undefined,
  modifiedAt: Date,
  createdAt: Date,
  tags: LocalizedText[],
  milestone?: LocalizedText,
): Board {
  return {
    id,
    title,
    summary,
    ownerId,
    collaboratorIds,
    classification,
    visibility,
    tags,
    milestone,
    templateId,
    modifiedAt: modifiedAt.toISOString(),
    createdAt: createdAt.toISOString(),
    starred: id === "board-strategy-workshop" || id === "board-exec-review",
    onlineUserIds: collaboratorIds.slice(0, 3),
    status: "active",
    snapshot: null,
    comments: [
      {
        id: `${id}-comment-1`,
        authorId: collaboratorIds[0],
        createdAt: subHours(modifiedAt, 1).toISOString(),
        text: baseComments.note1,
        resolved: false,
      },
      {
        id: `${id}-comment-2`,
        authorId: collaboratorIds[1] ?? ownerId,
        createdAt: subHours(modifiedAt, 4).toISOString(),
        text: baseComments.note2,
        resolved: true,
      },
    ],
    brief: null,
  };
}

export const boards: Board[] = [
  boardSeed(
    "board-strategy-workshop",
    t("Strategy Workshop", "ورشة الاستراتيجية"),
    t(
      "Align executive priorities, investment bets, and operating constraints across the next planning cycle.",
      "مواءمة أولويات القيادة ورهانات الاستثمار والقيود التشغيلية عبر دورة التخطيط المقبلة.",
    ),
    "user-awaiz",
    ["user-noura", "user-omar", "user-dalia", "user-khalid"],
    "restricted",
    "shared",
    "template-strategy-sprint",
    subHours(now, 2),
    subDays(now, 18),
    [t("Strategy", "استراتيجية"), t("Q3", "الربع الثالث")],
    t("SteerCo review 18 Mar", "مراجعة اللجنة 18 مارس"),
  ),
  boardSeed(
    "board-program-roadmap-q3",
    t("Program Roadmap Q3", "خارطة البرنامج للربع الثالث"),
    t(
      "Sequence the portfolio milestones, delivery gates, and partner commitments for the quarter.",
      "تسلسل مراحل المحفظة وبوابات التسليم والتزامات الشركاء للربع الحالي.",
    ),
    "user-omar",
    ["user-dalia", "user-salma", "user-khalid"],
    "internal",
    "workspace",
    "template-roadmap-q3",
    subHours(now, 7),
    subDays(now, 32),
    [t("Roadmap", "خارطة"), t("Portfolio", "محفظة")],
    t("Milestone sync 24 Mar", "مزامنة المعالم 24 مارس"),
  ),
  boardSeed(
    "board-engineering-planning",
    t("Engineering Planning", "تخطيط الهندسة"),
    t(
      "Map squads, dependencies, and release assumptions before the next build train starts.",
      "ربط الفرق والاعتماديات وافتراضات الإطلاق قبل بدء قطار البناء القادم.",
    ),
    "user-khalid",
    ["user-omar", "user-salma", "user-dalia"],
    "internal",
    "workspace",
    "template-engineering-plan",
    subHours(now, 12),
    subDays(now, 11),
    [t("Engineering", "الهندسة"), t("Release", "الإطلاق")],
  ),
  boardSeed(
    "board-risk-register",
    t("Risk Register", "سجل المخاطر"),
    t(
      "Maintain a current cross-program risk view with owners, mitigation plans, and escalation triggers.",
      "الحفاظ على عرض محدث للمخاطر عبر البرامج مع المسؤولين وخطط التخفيف ومحفزات التصعيد.",
    ),
    "user-salma",
    ["user-awaiz", "user-dalia", "user-omar"],
    "restricted",
    "shared",
    "template-risk-register",
    subHours(now, 20),
    subDays(now, 24),
    [t("Risk", "المخاطر"), t("Control", "التحكم")],
  ),
  boardSeed(
    "board-exec-review",
    t("Executive Review", "المراجعة التنفيذية"),
    t(
      "Bring key decisions, blockers, and the next leadership asks into a single executive surface.",
      "جمع القرارات الرئيسية والعوائق والطلبات القادمة للقيادة في سطح تنفيذي واحد.",
    ),
    "user-awaiz",
    ["user-noura", "user-omar", "user-dalia"],
    "restricted",
    "shared",
    "template-exec-review",
    subHours(now, 4),
    subDays(now, 6),
    [t("Leadership", "القيادة"), t("Decision", "قرار")],
    t("Review pack due 17 Mar", "حزمة المراجعة مطلوبة 17 مارس"),
  ),
  boardSeed(
    "board-product-discovery",
    t("Product Discovery", "استكشاف المنتج"),
    t(
      "Frame opportunity areas, evidence, and experiments before the next solution cycle.",
      "صياغة مجالات الفرص والأدلة والتجارب قبل دورة الحل القادمة.",
    ),
    "user-noura",
    ["user-awaiz", "user-khalid", "user-salma"],
    "internal",
    "workspace",
    "template-discovery",
    subDays(now, 1),
    subDays(now, 8),
    [t("Discovery", "الاكتشاف"), t("Research", "البحث")],
  ),
  boardSeed(
    "board-war-room-timeline",
    t("War Room Timeline", "الجدول الزمني لغرفة العمليات"),
    t(
      "Track critical events, response windows, and decisions during high-intensity coordination.",
      "تتبع الأحداث الحرجة ونوافذ الاستجابة والقرارات أثناء التنسيق عالي الكثافة.",
    ),
    "user-dalia",
    ["user-omar", "user-salma", "user-khalid"],
    "restricted",
    "shared",
    "template-roadmap-q3",
    subDays(now, 1.5),
    subDays(now, 15),
    [t("Incident", "حادثة"), t("Timeline", "جدول زمني")],
  ),
  boardSeed(
    "board-partner-onboarding",
    t("Partner Onboarding", "تهيئة الشركاء"),
    t(
      "Coordinate legal, technical, and operational readiness before onboarding a new partner entity.",
      "تنسيق الجاهزية القانونية والتقنية والتشغيلية قبل تهيئة جهة شريكة جديدة.",
    ),
    "user-dalia",
    ["user-awaiz", "user-salma"],
    "public",
    "workspace",
    "template-roadmap-q3",
    subDays(now, 2),
    subDays(now, 20),
    [t("Partner", "شريك"), t("Readiness", "الجاهزية")],
  ),
  boardSeed(
    "board-systems-architecture",
    t("Systems Architecture", "معمارية الأنظمة"),
    t(
      "Review target-state components, integrations, and decision records across the operating platform.",
      "مراجعة مكونات الحالة المستهدفة والتكاملات وسجلات القرار عبر منصة التشغيل.",
    ),
    "user-khalid",
    ["user-omar", "user-salma", "user-noura"],
    "internal",
    "workspace",
    "template-engineering-plan",
    subDays(now, 3),
    subDays(now, 35),
    [t("Architecture", "المعمارية"), t("Platform", "المنصة")],
  ),
  boardSeed(
    "board-incident-retrospective",
    t("Incident Retrospective", "مراجعة الحادثة"),
    t(
      "Capture the response timeline, root causes, and prevention actions after a major service event.",
      "توثيق التسلسل الزمني للاستجابة والأسباب الجذرية وإجراءات الوقاية بعد حدث خدمي رئيسي.",
    ),
    "user-salma",
    ["user-dalia", "user-khalid", "user-omar"],
    "internal",
    "shared",
    "template-risk-register",
    subDays(now, 5),
    subDays(now, 28),
    [t("Retrospective", "استرجاع"), t("Operations", "العمليات")],
  ),
];

export const notifications = [
  {
    id: "notification-1",
    title: t("Executive review board was updated", "تم تحديث لوحة المراجعة التنفيذية"),
    description: t(
      "Three new decisions were added before tomorrow's steering review.",
      "تمت إضافة ثلاثة قرارات جديدة قبل مراجعة التوجيه غداً.",
    ),
    createdAt: subHours(now, 1).toISOString(),
    read: false,
  },
  {
    id: "notification-2",
    title: t("Partner onboarding checklist is complete", "اكتملت قائمة تهيئة الشريك"),
    description: t(
      "Operational readiness items were cleared by the delivery office.",
      "تم إغلاق عناصر الجاهزية التشغيلية من قبل مكتب التسليم.",
    ),
    createdAt: subHours(now, 9).toISOString(),
    read: true,
  },
  {
    id: "notification-3",
    title: t("Risk register needs approval", "سجل المخاطر يحتاج إلى اعتماد"),
    description: t(
      "The restricted risk view is waiting for owner confirmation.",
      "عرض المخاطر المقيد ينتظر تأكيد المسؤول.",
    ),
    createdAt: subDays(now, 1).toISOString(),
    read: false,
  },
];

export const activity: ActivityItem[] = [
  {
    id: "activity-1",
    boardId: "board-strategy-workshop",
    actorId: "user-awaiz",
    action: t("Updated the investment lane and owner map", "حدّث مسار الاستثمار وخريطة المسؤولين"),
    createdAt: subHours(now, 2).toISOString(),
  },
  {
    id: "activity-2",
    boardId: "board-exec-review",
    actorId: "user-noura",
    action: t("Added decision signals for leadership review", "أضاف إشارات القرار لمراجعة القيادة"),
    createdAt: subHours(now, 4).toISOString(),
  },
  {
    id: "activity-3",
    boardId: "board-risk-register",
    actorId: "user-salma",
    action: t("Escalated two risk items to restricted status", "صعّد عنصرين من المخاطر إلى حالة مقيدة"),
    createdAt: subHours(now, 13).toISOString(),
  },
  {
    id: "activity-4",
    boardId: "board-systems-architecture",
    actorId: "user-khalid",
    action: t("Refined the target-state architecture frame", "حسّن إطار المعمارية المستهدفة"),
    createdAt: subDays(now, 2).toISOString(),
  },
];

export function createSeedState(): WorkspaceSeed {
  return {
    currentUserId: "user-awaiz",
    workspace: {
      id: "workspace-edge",
      name: t("EDGE Strategic Office", "مكتب EDGE الاستراتيجي"),
      plan: t("Enterprise Control", "تحكم مؤسسي"),
      members: users.map((user) => user.id),
    },
    users,
    boards,
    templates,
    notifications,
    activity,
    preferences: {
      locale: "en",
      theme: "light",
      collectionView: "grid",
      boardDensity: "comfortable",
      lastBoardId: "board-strategy-workshop",
      boardDefaults: {
        classification: "internal",
        visibility: "workspace",
      },
      notifications: {
        productUpdates: true,
        mentions: true,
        summaries: true,
      },
    },
  };
}
