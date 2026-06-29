import { BridgeFlowText } from './nodes/bridgeflow-text';

export function effects() {
  customElements.define('bridgeflow-text', BridgeFlowText);
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-text': BridgeFlowText;
  }
}
