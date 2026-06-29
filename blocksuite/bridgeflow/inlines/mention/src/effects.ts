import { BridgeFlowMention } from './bridgeflow-mention';

export function effects() {
  customElements.define('bridgeflow-mention', BridgeFlowMention);
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-mention': BridgeFlowMention;
  }
}
