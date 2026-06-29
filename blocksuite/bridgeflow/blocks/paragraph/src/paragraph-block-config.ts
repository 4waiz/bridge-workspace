import type { ParagraphBlockModel } from '@blocksuite/bridgeflow-model';
import { ConfigExtensionFactory } from '@blocksuite/std';

export interface ParagraphBlockConfig {
  getPlaceholder: (model: ParagraphBlockModel) => string;
}

export const ParagraphBlockConfigExtension =
  ConfigExtensionFactory<ParagraphBlockConfig>('bridgeflow:paragraph');
