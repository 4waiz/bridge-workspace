import type { LocalizedText, TemplateCategory } from "@/types/app";

const t = (en: string, ar: string): LocalizedText => ({ en, ar });

export const navMegaMenus = {
  solutions: [
    {
      title: t("Strategy Alignment", "مواءمة الاستراتيجية"),
      description: t(
        "Coordinate planning, prioritization, and executive sign-off in one visual layer.",
        "نسّق التخطيط وتحديد الأولويات واعتماد القيادة في طبقة مرئية واحدة.",
      ),
      href: "/templates",
    },
    {
      title: t("Delivery Coordination", "تنسيق التسليم"),
      description: t(
        "Track milestones, owners, and dependencies without losing operational context.",
        "تابع المراحل والمسؤولين والاعتماديات دون فقدان السياق التشغيلي.",
      ),
      href: "/dashboard",
    },
    {
      title: t("Architecture Reviews", "مراجعات المعمارية"),
      description: t(
        "Structure systems decisions, capability maps, and target-state conversations.",
        "هيكل قرارات الأنظمة وخرائط القدرات ومحادثات الحالة المستهدفة.",
      ),
      href: "/boards/board-systems-architecture",
    },
    {
      title: t("Executive Reporting", "التقارير التنفيذية"),
      description: t(
        "Generate briefs, presentation-ready views, and clear decision records for leadership.",
        "أنشئ ملخصات وعروضاً جاهزة وسجلات قرار واضحة للقيادة.",
      ),
      href: "/pricing",
    },
  ],
  media: [
    {
      title: t("Product Updates", "تحديثات المنتج"),
      description: t(
        "See how teams are improving board structure, search, and leadership workflows.",
        "اطّلع على كيف تحسّن الفرق بنية اللوحات والبحث وتدفقات عمل القيادة.",
      ),
      href: "/pricing",
    },
    {
      title: t("Security Notes", "ملاحظات الأمان"),
      description: t(
        "Review enterprise controls, classification models, and governance approaches.",
        "راجع الضوابط المؤسسية ونماذج التصنيف وأساليب الحوكمة.",
      ),
      href: "/settings",
    },
    {
      title: t("Customer Briefings", "إحاطات العملاء"),
      description: t(
        "Explore practical stories from strategy offices, PMOs, and delivery programs.",
        "استكشف قصصاً عملية من مكاتب الاستراتيجية ومكاتب إدارة المشاريع وبرامج التسليم.",
      ),
      href: "/dashboard",
    },
    {
      title: t("Operating Guides", "أدلة التشغيل"),
      description: t(
        "Adopt repeatable patterns for workshops, governance reviews, and risk management.",
        "اعتمد أنماطاً قابلة للتكرار للورش ومراجعات الحوكمة وإدارة المخاطر.",
      ),
      href: "/templates",
    },
  ],
};

export const homepageContent = {
  hero: {
    eyebrow: t("Strategic collaboration workspace", "مساحة تعاون استراتيجية"),
    title: t(
      "Plan, align, and execute in one shared workspace.",
      "خطط ونسّق ونفّذ داخل مساحة مشتركة واحدة.",
    ),
    description: t(
      "EDGE Workspace gives leadership teams, delivery offices, and operational squads one visual system for planning, whiteboarding, decision-making, and reporting at scale.",
      "يمنح EDGE Workspace فرق القيادة ومكاتب التسليم والفرق التشغيلية نظاماً مرئياً واحداً للتخطيط والسبورات وصنع القرار والتقارير على نطاق واسع.",
    ),
    primaryCta: t("Launch the demo workspace", "افتح مساحة العمل التجريبية"),
    secondaryCta: t("Review pricing", "راجع الأسعار"),
    callout: t("Trusted by control rooms, PMOs, and transformation offices.", "موثوق من غرف التحكم ومكاتب إدارة المشاريع ومكاتب التحول."),
  },
  socialProof: [
    "NorthBridge Capital",
    "Axis Delivery Group",
    "Summit Infrastructure",
    "Meridian Programs",
    "Harbour Systems",
    "Apex Governance",
  ],
  stories: [
    {
      id: "plan",
      label: t("Plan", "خطط"),
      title: t("Run planning cycles with decision-grade structure.", "أدر دورات التخطيط بهيكل صالح للقرار."),
      description: t(
        "Move from workshop energy to portfolio-ready outputs with framing lanes, templates, and executive review surfaces.",
        "انتقل من طاقة الورش إلى مخرجات جاهزة للمحفظة عبر مسارات التأطير والقوالب وسطح المراجعة التنفيذية.",
      ),
      bullets: [
        t("Template launchers for strategy, delivery, engineering, and risk.", "مشغلات قوالب للاستراتيجية والتسليم والهندسة والمخاطر."),
        t("Board classification built into every creation flow.", "تصنيف اللوحات مدمج في كل تدفق إنشاء."),
        t("Fast visual layout with high-density information design.", "تصميم بصري سريع بكثافة معلومات عالية."),
      ],
    },
    {
      id: "coordinate",
      label: t("Coordinate", "نسّق"),
      title: t("Keep owners, milestones, and context on the same surface.", "أبقِ المسؤولين والمراحل والسياق على السطح نفسه."),
      description: t(
        "Use structured boards, filters, and timeline views to keep complex workstreams aligned without fragmenting the story.",
        "استخدم اللوحات المنظمة والفلاتر وعروض الجدول الزمني للحفاظ على مواءمة مسارات العمل المعقدة دون تشتيت القصة.",
      ),
      bullets: [
        t("Search boards by topic, owner, or operating signal.", "ابحث في اللوحات حسب الموضوع أو المالك أو الإشارة التشغيلية."),
        t("Track modifications and team presence across critical boards.", "تابع التعديلات وحضور الفريق عبر اللوحات الحرجة."),
        t("Move between dashboard, templates, and active boards instantly.", "انتقل فوراً بين لوحة التحكم والقوالب واللوحات النشطة."),
      ],
    },
    {
      id: "brief",
      label: t("Brief", "ألخّص"),
      title: t("Convert board activity into leadership-ready briefings.", "حوّل نشاط اللوحة إلى إحاطات جاهزة للقيادة."),
      description: t(
        "Generate local executive briefs from board content, then present by section without workspace clutter.",
        "أنشئ ملخصات تنفيذية محلية من محتوى اللوحة ثم اعرضها حسب القسم دون ضوضاء مساحة العمل.",
      ),
      bullets: [
        t("Executive Brief mode with objective, decisions, risks, and next steps.", "وضع الملخص التنفيذي مع الهدف والقرارات والمخاطر والخطوات التالية."),
        t("Presentation mode focused on frames and review order.", "وضع العرض يركز على الإطارات وترتيب المراجعة."),
        t("Local-first summaries ready for a future AI service.", "ملخصات محلية جاهزة لخدمة ذكاء اصطناعي مستقبلية."),
      ],
    },
  ],
  capabilities: [
    {
      title: t("High-clarity board workspace", "مساحة لوحات عالية الوضوح"),
      description: t(
        "A whiteboard surface tuned for strategy workshops, architecture reviews, and operational coordination.",
        "سطح سبورة مضبوط لورش الاستراتيجية ومراجعات المعمارية والتنسيق التشغيلي.",
      ),
    },
    {
      title: t("Operational dashboard", "لوحة تشغيلية"),
      description: t(
        "Track recent boards, favorites, templates, classification state, and delivery momentum from one dashboard.",
        "تابع اللوحات الأخيرة والمفضلات والقوالب وحالة التصنيف وزخم التسليم من لوحة واحدة.",
      ),
    },
    {
      title: t("Bilingual collaboration", "تعاون ثنائي اللغة"),
      description: t(
        "Switch between English and Arabic instantly with RTL-aware layouts across the app shell.",
        "بدّل بين الإنجليزية والعربية فوراً مع تخطيطات تدعم الاتجاه من اليمين إلى اليسار.",
      ),
    },
    {
      title: t("Local-first persistence", "استمرارية محلية أولاً"),
      description: t(
        "Keep demo data, board activity, settings, and language state without backend dependency.",
        "احتفظ ببيانات العرض ونشاط اللوحة والإعدادات وحالة اللغة دون الاعتماد على خلفية.",
      ),
    },
  ],
  stats: [
    { value: "4.2x", label: t("faster review preparation", "أسرع في تجهيز المراجعات") },
    { value: "87%", label: t("fewer status fragments", "أجزاء حالة أقل") },
    { value: "12", label: t("core board workflows", "تدفقات لوحات أساسية") },
    { value: "2", label: t("languages with RTL support", "لغتان مع دعم RTL") },
  ],
  caseStudy: {
    company: "Harbour Systems",
    headline: t(
      "EDGE replaced fragmented review decks with one operating workspace.",
      "استبدلت EDGE العروض المتفرقة بمساحة تشغيل واحدة.",
    ),
    description: t(
      "The transformation office consolidated planning, risk review, and weekly leadership reporting into one structured board system with classification controls.",
      "قام مكتب التحول بدمج التخطيط ومراجعة المخاطر والتقارير الأسبوعية للقيادة في نظام لوحات منظم واحد مع ضوابط تصنيف.",
    ),
    outcomes: [
      t("32% faster steering-pack preparation", "تجهيز أسرع لحزمة التوجيه بنسبة 32٪"),
      t("4 concurrent programs aligned in one portfolio view", "مواءمة 4 برامج متزامنة في عرض محفظة واحد"),
      t("Executive briefing now generated from live board context", "الملخص التنفيذي يُنشأ الآن من سياق حي على اللوحة"),
    ],
  },
  templatesShowcase: [
    {
      category: "strategy" as TemplateCategory,
      name: t("Enterprise strategy room", "غرفة الاستراتيجية المؤسسية"),
      description: t(
        "Create options, pressure-test tradeoffs, and leave with named owners.",
        "أنشئ الخيارات واختبر المفاضلات وغادر بمسؤولين محددين.",
      ),
    },
    {
      category: "engineering" as TemplateCategory,
      name: t("Architecture decision map", "خريطة قرار المعمارية"),
      description: t(
        "Review current-state gaps, capability moves, and target architecture decisions.",
        "راجع فجوات الحالة الحالية وتحركات القدرات وقرارات المعمارية المستهدفة.",
      ),
    },
    {
      category: "executive" as TemplateCategory,
      name: t("Leadership review pack", "حزمة مراجعة القيادة"),
      description: t(
        "Move from board detail to a concise leadership narrative without rebuilding slides.",
        "انتقل من تفاصيل اللوحة إلى سرد قيادي موجز دون إعادة بناء الشرائح.",
      ),
    },
  ],
  integrations: [
    t("Communication channels", "قنوات التواصل"),
    t("Task and ticket systems", "أنظمة المهام والتذاكر"),
    t("Document repositories", "مستودعات المستندات"),
    t("Identity and access services", "خدمات الهوية والوصول"),
    t("Data and reporting layers", "طبقات البيانات والتقارير"),
    t("Enterprise file stores", "مخازن الملفات المؤسسية"),
  ],
  security: [
    {
      title: t("Board classification", "تصنيف اللوحات"),
      description: t(
        "Set Public, Internal, or Restricted status on every board and reflect it across the product.",
        "عيّن حالة عام أو داخلي أو مقيد على كل لوحة واعكسها عبر المنتج.",
      ),
    },
    {
      title: t("Enterprise operating defaults", "افتراضيات تشغيل مؤسسية"),
      description: t(
        "Control visibility, board defaults, team preferences, and language behavior from one settings surface.",
        "تحكم في الرؤية وافتراضيات اللوحات وتفضيلات الفريق وسلوك اللغة من سطح إعدادات واحد.",
      ),
    },
    {
      title: t("Future-ready backend path", "مسار خلفية جاهز للمستقبل"),
      description: t(
        "The app is structured for a later Supabase or API-backed collaboration layer without reworking the UX shell.",
        "تم تنظيم التطبيق لطبقة تعاون مستقبلية مع Supabase أو API دون إعادة صياغة واجهة التجربة.",
      ),
    },
  ],
  footerColumns: [
    {
      title: t("Product", "المنتج"),
      links: [
        { label: t("Workspace", "مساحة العمل"), href: "/dashboard" },
        { label: t("Templates", "القوالب"), href: "/templates" },
        { label: t("Pricing", "الأسعار"), href: "/pricing" },
      ],
    },
    {
      title: t("Company", "الشركة"),
      links: [
        { label: t("About", "حول"), href: "/" },
        { label: t("Careers", "الوظائف"), href: "/" },
        { label: t("Media", "الإعلام"), href: "/" },
      ],
    },
    {
      title: t("Resources", "الموارد"),
      links: [
        { label: t("Dashboard demo", "عرض لوحة التحكم"), href: "/dashboard" },
        { label: t("Settings", "الإعدادات"), href: "/settings" },
        { label: t("Profile", "الملف الشخصي"), href: "/profile" },
      ],
    },
    {
      title: t("Support", "الدعم"),
      links: [
        { label: t("Contact sales", "تواصل مع المبيعات"), href: "/login" },
        { label: t("Open workspace", "افتح مساحة العمل"), href: "/dashboard" },
        { label: t("Security overview", "نظرة على الأمان"), href: "/settings" },
      ],
    },
  ],
};

export const pricingPlans = [
  {
    id: "starter",
    name: t("Starter", "البداية"),
    price: "$0",
    description: t(
      "For teams validating structured visual collaboration.",
      "للفرق التي تختبر التعاون المرئي المنظم.",
    ),
    features: [
      t("Unlimited demo boards", "لوحات تجريبية غير محدودة"),
      t("Templates and command palette", "القوالب ولوحة الأوامر"),
      t("English and Arabic support", "دعم الإنجليزية والعربية"),
    ],
  },
  {
    id: "control",
    name: t("Control", "التحكم"),
    price: "$24",
    description: t(
      "For operating teams running recurring reviews and delivery rituals.",
      "للفرق التشغيلية التي تدير مراجعات دورية وإيقاعات تسليم.",
    ),
    features: [
      t("Board classification controls", "ضوابط تصنيف اللوحات"),
      t("Executive brief workflows", "تدفقات الملخص التنفيذي"),
      t("Shared dashboard views", "عروض لوحة تحكم مشتركة"),
    ],
    featured: true,
  },
  {
    id: "enterprise",
    name: t("Enterprise", "المؤسسي"),
    price: "Custom",
    description: t(
      "For strategic offices ready to integrate identity, storage, and collaboration services.",
      "للمكاتب الاستراتيجية الجاهزة لدمج الهوية والتخزين وخدمات التعاون.",
    ),
    features: [
      t("Planned Supabase/API path", "مسار مخطط لـ Supabase/API"),
      t("Security and governance controls", "ضوابط الأمن والحوكمة"),
      t("Executive operating support", "دعم التشغيل التنفيذي"),
    ],
  },
];
