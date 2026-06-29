import type { EditorHost } from '@blocksuite/bridgeflow/std';

import {
  BRIDGEFLOW_AI_PANEL_WIDGET,
  BridgeFlowAIPanelWidget,
} from '../widgets/ai-panel/ai-panel';

export const getAIPanelWidget = (host: EditorHost): BridgeFlowAIPanelWidget => {
  const rootBlockId = host.store.root?.id;
  if (!rootBlockId) {
    throw new Error('rootBlockId is not found');
  }
  const aiPanel = host.view.getWidget(BRIDGEFLOW_AI_PANEL_WIDGET, rootBlockId);
  if (!(aiPanel instanceof BridgeFlowAIPanelWidget)) {
    throw new Error('AI panel not found');
  }
  return aiPanel;
};
