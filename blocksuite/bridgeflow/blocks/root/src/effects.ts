import {
  EdgelessRootBlockComponent,
  EdgelessRootPreviewBlockComponent,
  PageRootBlockComponent,
  PreviewRootBlockComponent,
} from './index.js';

export function effects() {
  // Register components by category
  registerRootComponents();
}

function registerRootComponents() {
  customElements.define('bridgeflow-page-root', PageRootBlockComponent);
  customElements.define('bridgeflow-preview-root', PreviewRootBlockComponent);
  customElements.define('bridgeflow-edgeless-root', EdgelessRootBlockComponent);
  customElements.define(
    'bridgeflow-edgeless-root-preview',
    EdgelessRootPreviewBlockComponent
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-edgeless-root': EdgelessRootBlockComponent;
    'bridgeflow-page-root': PageRootBlockComponent;
  }
}
