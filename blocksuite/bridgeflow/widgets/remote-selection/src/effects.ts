import { BRIDGEFLOW_DOC_REMOTE_SELECTION_WIDGET } from './doc';
import { BridgeFlowDocRemoteSelectionWidget } from './doc/doc-remote-selection';
import {
  BRIDGEFLOW_EDGELESS_REMOTE_SELECTION_WIDGET,
  EdgelessRemoteSelectionWidget,
} from './edgeless';

export function effects() {
  customElements.define(
    BRIDGEFLOW_DOC_REMOTE_SELECTION_WIDGET,
    BridgeFlowDocRemoteSelectionWidget
  );
  customElements.define(
    BRIDGEFLOW_EDGELESS_REMOTE_SELECTION_WIDGET,
    EdgelessRemoteSelectionWidget
  );
}
