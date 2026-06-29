import { WidgetViewExtension } from '@blocksuite/std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { BRIDGEFLOW_SCROLL_ANCHORING_WIDGET } from './scroll-anchoring.js';

export * from './scroll-anchoring.js';

export const scrollAnchoringWidget = WidgetViewExtension(
  'bridgeflow:page',
  BRIDGEFLOW_SCROLL_ANCHORING_WIDGET,
  literal`${unsafeStatic(BRIDGEFLOW_SCROLL_ANCHORING_WIDGET)}`
);
