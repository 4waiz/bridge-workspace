import { BridgeFlowFootnoteNode } from './footnote-node/footnote-node';
import { FootNotePopup } from './footnote-node/footnote-popup';
import { FootNotePopupChip } from './footnote-node/footnote-popup-chip';

export function effects() {
  customElements.define('bridgeflow-footnote-node', BridgeFlowFootnoteNode);
  customElements.define('footnote-popup', FootNotePopup);
  customElements.define('footnote-popup-chip', FootNotePopupChip);
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-footnote-node': BridgeFlowFootnoteNode;
    'footnote-popup': FootNotePopup;
    'footnote-popup-chip': FootNotePopupChip;
  }
}
