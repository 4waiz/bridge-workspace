import { SurfaceBlockComponent } from './surface-block.js';
import { SurfaceBlockVoidComponent } from './surface-block-void.js';

export function effects() {
  customElements.define('bridgeflow-surface-void', SurfaceBlockVoidComponent);
  customElements.define('bridgeflow-surface', SurfaceBlockComponent);
}
