import {
  BRIDGEFLOW_KEYBOARD_TOOLBAR_WIDGET,
  BridgeFlowKeyboardToolbarWidget,
} from './index.js';
import {
  BRIDGEFLOW_KEYBOARD_TOOL_PANEL,
  BridgeFlowKeyboardToolPanel,
} from './keyboard-tool-panel.js';
import {
  BRIDGEFLOW_KEYBOARD_TOOLBAR,
  BridgeFlowKeyboardToolbar,
} from './keyboard-toolbar.js';

export function effects() {
  customElements.define(
    BRIDGEFLOW_KEYBOARD_TOOLBAR_WIDGET,
    BridgeFlowKeyboardToolbarWidget
  );
  customElements.define(BRIDGEFLOW_KEYBOARD_TOOLBAR, BridgeFlowKeyboardToolbar);
  customElements.define(BRIDGEFLOW_KEYBOARD_TOOL_PANEL, BridgeFlowKeyboardToolPanel);
}

declare global {
  interface HTMLElementTagNameMap {
    [BRIDGEFLOW_KEYBOARD_TOOLBAR]: BridgeFlowKeyboardToolbar;
    [BRIDGEFLOW_KEYBOARD_TOOL_PANEL]: BridgeFlowKeyboardToolPanel;
  }
}
