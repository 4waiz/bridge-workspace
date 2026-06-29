import { DocTitle } from './doc-title';

export * from './doc-title';

export function effects() {
  customElements.define('bridgeflow-linked-doc-title', DocTitle);
}
