import {
  BRIDGEFLOW_FRAME_TITLE_WIDGET,
  BridgeFlowFrameTitleWidget,
} from './bridgeflow-frame-title-widget.js';
import { EdgelessFrameTitleEditor } from './edgeless-frame-title-editor.js';
import { BRIDGEFLOW_FRAME_TITLE, BridgeFlowFrameTitle } from './frame-title.js';

export function effects() {
  customElements.define(BRIDGEFLOW_FRAME_TITLE_WIDGET, BridgeFlowFrameTitleWidget);
  customElements.define(BRIDGEFLOW_FRAME_TITLE, BridgeFlowFrameTitle);
  customElements.define(
    'edgeless-frame-title-editor',
    EdgelessFrameTitleEditor
  );
}
