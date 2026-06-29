import { WidgetViewExtension } from '@blocksuite/std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { BRIDGEFLOW_TOOLBAR_WIDGET } from './toolbar';

export * from './toolbar';

export const toolbarWidget = WidgetViewExtension(
  'bridgeflow:page',
  BRIDGEFLOW_TOOLBAR_WIDGET,
  literal`${unsafeStatic(BRIDGEFLOW_TOOLBAR_WIDGET)}`
);
