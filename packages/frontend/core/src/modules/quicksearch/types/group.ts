import type { I18nString } from '@bridgeflow/i18n';

export interface QuickSearchGroup {
  id: string;
  label: I18nString;
  score?: number;
}
