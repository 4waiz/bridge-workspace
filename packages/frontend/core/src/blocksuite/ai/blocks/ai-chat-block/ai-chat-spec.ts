import { BlockViewExtension } from '@blocksuite/bridgeflow/std';
import type { ExtensionType } from '@blocksuite/bridgeflow/store';
import { literal } from 'lit/static-html.js';

export const AIChatBlockSpec: ExtensionType[] = [
  BlockViewExtension('bridgeflow:embed-ai-chat', model => {
    const parent = model.store.getParent(model.id);

    if (parent?.flavour === 'bridgeflow:surface') {
      return literal`bridgeflow-edgeless-ai-chat`;
    }

    return literal`bridgeflow-ai-chat`;
  }),
];
