import { textKeymap } from '@blocksuite/bridgeflow-inline-preset';
import { CodeBlockSchema } from '@blocksuite/bridgeflow-model';
import { KeymapExtension } from '@blocksuite/std';

export const CodeKeymapExtension = KeymapExtension(textKeymap, {
  flavour: CodeBlockSchema.model.flavour,
});
