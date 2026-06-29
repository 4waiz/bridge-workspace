import { BRIDGEFLOW_TOOLBAR_WIDGET, BridgeFlowToolbarWidget } from './toolbar';

export function effects() {
  customElements.define(BRIDGEFLOW_TOOLBAR_WIDGET, BridgeFlowToolbarWidget);
}

declare global {
  interface HTMLElementTagNameMap {
    [BRIDGEFLOW_TOOLBAR_WIDGET]: BridgeFlowToolbarWidget;
  }
}
