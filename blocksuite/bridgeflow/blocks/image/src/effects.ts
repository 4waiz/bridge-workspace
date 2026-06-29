import { ImageBlockFallbackCard } from './components/image-block-fallback.js';
import { ImageBlockPageComponent } from './components/page-image-block.js';
import { ImageBlockComponent } from './image-block.js';
import { ImageEdgelessBlockComponent } from './image-edgeless-block.js';
import { ImageEdgelessPlaceholderBlockComponent } from './preview-image/edgeless.js';
import { ImagePlaceholderBlockComponent } from './preview-image/page.js';

export function effects() {
  customElements.define('bridgeflow-image', ImageBlockComponent);
  customElements.define('bridgeflow-edgeless-image', ImageEdgelessBlockComponent);
  customElements.define('bridgeflow-page-image', ImageBlockPageComponent);
  customElements.define('bridgeflow-image-fallback-card', ImageBlockFallbackCard);
  customElements.define(
    'bridgeflow-placeholder-preview-image',
    ImagePlaceholderBlockComponent
  );
  customElements.define(
    'bridgeflow-edgeless-placeholder-preview-image',
    ImageEdgelessPlaceholderBlockComponent
  );
}
