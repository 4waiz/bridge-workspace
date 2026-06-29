import { BlockSchemaExtension } from '../extension/schema.js';
import { BlockModel, defineBlockSchema } from '../model/index.js';

export const RootBlockSchema = defineBlockSchema({
  flavour: 'bridgeflow:page',
  props: internal => ({
    title: internal.Text(),
    count: 0,
    style: {} as Record<string, unknown>,
    items: [] as unknown[],
  }),
  metadata: {
    version: 2,
    role: 'root',
  },
});

export const RootBlockSchemaExtension = BlockSchemaExtension(RootBlockSchema);

export class RootBlockModel extends BlockModel<
  ReturnType<(typeof RootBlockSchema)['model']['props']>
> {}

export const NoteBlockSchema = defineBlockSchema({
  flavour: 'bridgeflow:note',
  props: () => ({}),
  metadata: {
    version: 1,
    role: 'hub',
    parent: ['bridgeflow:page'],
    children: [
      'bridgeflow:paragraph',
      'bridgeflow:list',
      'bridgeflow:code',
      'bridgeflow:divider',
      'bridgeflow:database',
      'bridgeflow:data-view',
      'bridgeflow:image',
      'bridgeflow:note-block-*',
      'bridgeflow:bookmark',
      'bridgeflow:attachment',
      'bridgeflow:surface-ref',
      'bridgeflow:embed-*',
    ],
  },
});

export const NoteBlockSchemaExtension = BlockSchemaExtension(NoteBlockSchema);

export const ParagraphBlockSchema = defineBlockSchema({
  flavour: 'bridgeflow:paragraph',
  props: internal => ({
    type: 'text',
    text: internal.Text(),
  }),
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'bridgeflow:note',
      'bridgeflow:database',
      'bridgeflow:paragraph',
      'bridgeflow:list',
    ],
  },
});

export const ParagraphBlockSchemaExtension =
  BlockSchemaExtension(ParagraphBlockSchema);

export const ListBlockSchema = defineBlockSchema({
  flavour: 'bridgeflow:list',
  props: internal => ({
    type: 'bulleted',
    text: internal.Text(),
    checked: false,
    collapsed: false,
  }),
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'bridgeflow:note',
      'bridgeflow:database',
      'bridgeflow:list',
      'bridgeflow:paragraph',
    ],
  },
});

export const ListBlockSchemaExtension = BlockSchemaExtension(ListBlockSchema);

export const DividerBlockSchema = defineBlockSchema({
  flavour: 'bridgeflow:divider',
  metadata: {
    version: 1,
    role: 'content',
    children: [],
  },
});

export const DividerBlockSchemaExtension =
  BlockSchemaExtension(DividerBlockSchema);
