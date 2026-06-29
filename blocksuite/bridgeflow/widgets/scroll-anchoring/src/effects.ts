import {
  BRIDGEFLOW_SCROLL_ANCHORING_WIDGET,
  BridgeFlowScrollAnchoringWidget,
} from './scroll-anchoring.js';

export function effects() {
  customElements.define(
    BRIDGEFLOW_SCROLL_ANCHORING_WIDGET,
    BridgeFlowScrollAnchoringWidget
  );
}

declare global {
  interface HTMLElementTagNameMap {
    [BRIDGEFLOW_SCROLL_ANCHORING_WIDGET]: BridgeFlowScrollAnchoringWidget;
  }
}
