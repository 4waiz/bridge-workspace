import { ListBlockComponent } from './list-block.js';

export function effects() {
  customElements.define('bridgeflow-list', ListBlockComponent);
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-list': ListBlockComponent;
  }
}
