import type { RootBlockModel } from '@blocksuite/bridgeflow-model';
import { WidgetComponent, WidgetViewExtension } from '@blocksuite/std';
import { css, html } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { literal, unsafeStatic } from 'lit/static-html.js';

export const BRIDGEFLOW_VIEWPORT_OVERLAY_WIDGET = 'bridgeflow-viewport-overlay-widget';

export class BridgeFlowViewportOverlayWidget extends WidgetComponent<RootBlockModel> {
  static override styles = css`
    .bridgeflow-viewport-overlay-widget {
      position: absolute;
      top: 0;
      left: 0;
      background: transparent;
      pointer-events: none;
      z-index: calc(var(--bridgeflow-z-index-popover) - 1);
    }

    .bridgeflow-viewport-overlay-widget.lock {
      pointer-events: auto;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.handleEvent(
      'dragStart',
      () => {
        return this._lockViewport;
      },
      { global: true }
    );
    this.handleEvent(
      'pointerDown',
      () => {
        return this._lockViewport;
      },
      { global: true }
    );
    this.handleEvent(
      'click',
      () => {
        return this._lockViewport;
      },
      { global: true }
    );
  }

  lock() {
    this._lockViewport = true;
  }

  override render() {
    const classes = classMap({
      'bridgeflow-viewport-overlay-widget': true,
      lock: this._lockViewport,
    });
    const style = styleMap({
      width: `${this._lockViewport ? '100vw' : '0'}`,
      height: `${this._lockViewport ? '100%' : '0'}`,
    });
    return html` <div class=${classes} style=${style}></div> `;
  }

  toggleLock() {
    this._lockViewport = !this._lockViewport;
  }

  unlock() {
    this._lockViewport = false;
  }

  @state()
  private accessor _lockViewport = false;
}

export const viewportOverlayWidget = WidgetViewExtension(
  'bridgeflow:page',
  BRIDGEFLOW_VIEWPORT_OVERLAY_WIDGET,
  literal`${unsafeStatic(BRIDGEFLOW_VIEWPORT_OVERLAY_WIDGET)}`
);

declare global {
  interface HTMLElementTagNameMap {
    [BRIDGEFLOW_VIEWPORT_OVERLAY_WIDGET]: BridgeFlowViewportOverlayWidget;
  }
}
