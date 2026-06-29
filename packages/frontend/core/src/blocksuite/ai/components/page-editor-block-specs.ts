import { ViewExtensionManager } from '@blocksuite/bridgeflow/ext-loader';
import { getInternalViewExtensions } from '@blocksuite/bridgeflow/extensions/view';
import { BlockViewIdentifier } from '@blocksuite/bridgeflow/std';
import type { ExtensionType } from '@blocksuite/bridgeflow/store';
import { literal } from 'lit/static-html.js';

const manager = new ViewExtensionManager([...getInternalViewExtensions()]);
const customPageEditorBlockSpecs: ExtensionType[] = [
  ...manager.get('page'),
  {
    setup: di => {
      di.override(
        BlockViewIdentifier('bridgeflow:page'),
        () => literal`bridgeflow-page-root`
      );
    },
  },
];

export const getCustomPageEditorBlockSpecs = () => {
  return customPageEditorBlockSpecs;
};
