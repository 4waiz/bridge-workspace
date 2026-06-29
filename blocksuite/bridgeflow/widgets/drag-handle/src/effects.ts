import {
  EDGELESS_DND_PREVIEW_ELEMENT,
  EdgelessDndPreviewElement,
} from './components/edgeless-preview/preview';
import { BRIDGEFLOW_DRAG_HANDLE_WIDGET } from './consts';
import { BridgeFlowDragHandleWidget } from './drag-handle';

export function effects() {
  customElements.define(BRIDGEFLOW_DRAG_HANDLE_WIDGET, BridgeFlowDragHandleWidget);
  customElements.define(
    EDGELESS_DND_PREVIEW_ELEMENT,
    EdgelessDndPreviewElement
  );
}
