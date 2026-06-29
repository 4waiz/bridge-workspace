import { type FrameBlockModel } from '@blocksuite/bridgeflow-model';
import { WidgetComponent, WidgetViewExtension } from '@blocksuite/std';
import { html } from 'lit';
import { literal, unsafeStatic } from 'lit/static-html.js';

export const BRIDGEFLOW_FRAME_TITLE_WIDGET = 'bridgeflow-frame-title-widget';

export class BridgeFlowFrameTitleWidget extends WidgetComponent<FrameBlockModel> {
  override render() {
    return html`<bridgeflow-frame-title
      .model=${this.model}
      data-id=${this.model.id}
    ></bridgeflow-frame-title>`;
  }
}

export const frameTitleWidget = WidgetViewExtension(
  'bridgeflow:frame',
  BRIDGEFLOW_FRAME_TITLE_WIDGET,
  literal`${unsafeStatic(BRIDGEFLOW_FRAME_TITLE_WIDGET)}`
);
