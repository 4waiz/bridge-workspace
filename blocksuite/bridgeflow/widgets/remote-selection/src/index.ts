import { WidgetViewExtension } from '@blocksuite/std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { BRIDGEFLOW_DOC_REMOTE_SELECTION_WIDGET } from './doc';
import { BRIDGEFLOW_EDGELESS_REMOTE_SELECTION_WIDGET } from './edgeless';

export * from './doc';
export * from './edgeless';

export const docRemoteSelectionWidget = WidgetViewExtension(
  'bridgeflow:page',
  BRIDGEFLOW_DOC_REMOTE_SELECTION_WIDGET,
  literal`${unsafeStatic(BRIDGEFLOW_DOC_REMOTE_SELECTION_WIDGET)}`
);

export const edgelessRemoteSelectionWidget = WidgetViewExtension(
  'bridgeflow:page',
  BRIDGEFLOW_EDGELESS_REMOTE_SELECTION_WIDGET,
  literal`${unsafeStatic(BRIDGEFLOW_EDGELESS_REMOTE_SELECTION_WIDGET)}`
);
