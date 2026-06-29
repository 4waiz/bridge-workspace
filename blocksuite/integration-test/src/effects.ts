import '@blocksuite/bridgeflow/effects';

import { TestBridgeFlowEditorContainer } from './editors/index.js';

export function effects() {
  customElements.define('bridgeflow-editor-container', TestBridgeFlowEditorContainer);
}
