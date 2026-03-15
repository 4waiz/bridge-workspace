import type { TLEditorSnapshot } from "tldraw";

export type Locale = "en" | "ar";
export type ThemeMode = "light" | "dark" | "system";
export type ClassificationLevel = "public" | "internal" | "restricted";
export type BoardVisibility = "private" | "workspace" | "shared";
export type CollectionView = "grid" | "list" | "timeline";
export type TemplateCategory =
  | "strategy"
  | "engineering"
  | "operations"
  | "delivery"
  | "executive"
  | "workshops";
export type BoardStatus = "active" | "archived" | "trash";

export type LocalizedText = {
  en: string;
  ar: string;
};

export type User = {
  id: string;
  name: string;
  role: LocalizedText;
  email: string;
  initials: string;
  color: string;
};

export type BoardComment = {
  id: string;
  authorId: string;
  createdAt: string;
  text: LocalizedText;
  location?: {
    x: number;
    y: number;
  };
  resolved: boolean;
};

export type ExecutiveBrief = {
  objective: LocalizedText[];
  decisions: LocalizedText[];
  risks: LocalizedText[];
  openItems: LocalizedText[];
  owners: LocalizedText[];
  nextSteps: LocalizedText[];
  generatedAt: string;
};

export type Board = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  ownerId: string;
  collaboratorIds: string[];
  classification: ClassificationLevel;
  visibility: BoardVisibility;
  tags: LocalizedText[];
  milestone?: LocalizedText;
  templateId?: string;
  modifiedAt: string;
  createdAt: string;
  starred: boolean;
  onlineUserIds: string[];
  status: BoardStatus;
  snapshot: TLEditorSnapshot | null;
  comments: BoardComment[];
  brief: ExecutiveBrief | null;
};

export type Template = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  category: TemplateCategory;
  featured?: boolean;
  structure: string[];
  tags: LocalizedText[];
  useCases: LocalizedText[];
};

export type NotificationItem = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  createdAt: string;
  read: boolean;
};

export type ActivityItem = {
  id: string;
  boardId: string;
  actorId: string;
  action: LocalizedText;
  createdAt: string;
};

export type Workspace = {
  id: string;
  name: LocalizedText;
  plan: LocalizedText;
  members: string[];
};

export type AppPreferences = {
  locale: Locale;
  theme: ThemeMode;
  collectionView: CollectionView;
  boardDensity: "comfortable" | "compact";
  lastBoardId: string | null;
  boardDefaults: {
    classification: ClassificationLevel;
    visibility: BoardVisibility;
  };
  notifications: {
    productUpdates: boolean;
    mentions: boolean;
    summaries: boolean;
  };
};

export type WorkspaceSeed = {
  currentUserId: string;
  workspace: Workspace;
  users: User[];
  boards: Board[];
  templates: Template[];
  notifications: NotificationItem[];
  activity: ActivityItem[];
  preferences: AppPreferences;
};
