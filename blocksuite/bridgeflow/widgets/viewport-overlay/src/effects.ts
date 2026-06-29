import {
  BRIDGEFLOW_VIEWPORT_OVERLAY_WIDGET,
  BridgeFlowViewportOverlayWidget,
} from './index';

export function effects() {
  customElements.define(
    BRIDGEFLOW_VIEWPORT_OVERLAY_WIDGET,
    BridgeFlowViewportOverlayWidget
  );
}
