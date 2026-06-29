import { insertEmbedCard } from '@blocksuite/bridgeflow-block-embed';
import type { EmbedCardStyle, ReferenceParams } from '@blocksuite/bridgeflow-model';
import type { Command } from '@blocksuite/std';

export type LinkableFlavour =
  | 'bridgeflow:bookmark'
  | 'bridgeflow:embed-linked-doc'
  | 'bridgeflow:embed-synced-doc'
  | 'bridgeflow:embed-iframe'
  | 'bridgeflow:embed-figma'
  | 'bridgeflow:embed-github'
  | 'bridgeflow:embed-loom'
  | 'bridgeflow:embed-youtube';

export type InsertedLinkType = {
  flavour: LinkableFlavour;
} | null;

export const insertEmbedLinkedDocCommand: Command<
  {
    docId: string;
    params?: ReferenceParams;
  },
  { blockId: string }
> = (ctx, next) => {
  const { docId, params, std } = ctx;
  const flavour = 'bridgeflow:embed-linked-doc';
  const targetStyle: EmbedCardStyle = 'vertical';
  const props: Record<string, unknown> = { pageId: docId };
  if (params) props.params = params;
  const blockId = insertEmbedCard(std, { flavour, targetStyle, props });
  if (!blockId) return;
  next({ blockId });
};
