import type { OpSchema } from '@kanban-studios/infra/op';

import type { PDFMeta, RenderedPage, RenderPageOpts } from './types';

export interface ClientOps extends OpSchema {
  open: [{ data: ArrayBuffer }, PDFMeta];
  render: [RenderPageOpts, RenderedPage];
}
