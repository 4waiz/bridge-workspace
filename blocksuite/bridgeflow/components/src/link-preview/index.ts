import { LinkPreview } from './link';

export * from './link';

export function effects() {
  customElements.define('bridgeflow-link-preview', LinkPreview);
}
