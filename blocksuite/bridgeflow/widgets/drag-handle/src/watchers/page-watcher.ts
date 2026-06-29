import { PageViewportService } from '@blocksuite/bridgeflow-shared/services';

import type { BridgeFlowDragHandleWidget } from '../drag-handle.js';

export class PageWatcher {
  get pageViewportService() {
    return this.widget.std.get(PageViewportService);
  }

  constructor(readonly widget: BridgeFlowDragHandleWidget) {}

  watch() {
    const { disposables } = this.widget;

    disposables.add(
      this.pageViewportService.subscribe(() => {
        this.widget.hide();
      })
    );
  }
}
