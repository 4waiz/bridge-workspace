import { BridgeFlowReference, ReferencePopup } from './reference-node';

export function effects() {
  customElements.define('reference-popup', ReferencePopup);
  customElements.define('bridgeflow-reference', BridgeFlowReference);
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-reference': BridgeFlowReference;
    'reference-popup': ReferencePopup;
  }
}
