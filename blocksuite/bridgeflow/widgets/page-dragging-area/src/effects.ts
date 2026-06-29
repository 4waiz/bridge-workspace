import {
  BRIDGEFLOW_PAGE_DRAGGING_AREA_WIDGET,
  BridgeFlowPageDraggingAreaWidget,
} from './index';

export function effects() {
  customElements.define(
    BRIDGEFLOW_PAGE_DRAGGING_AREA_WIDGET,
    BridgeFlowPageDraggingAreaWidget
  );
}
