import { AttachmentBlockComponent } from './attachment-block';
import { AttachmentEdgelessBlockComponent } from './attachment-edgeless-block';

export function effects() {
  customElements.define(
    'bridgeflow-edgeless-attachment',
    AttachmentEdgelessBlockComponent
  );
  customElements.define('bridgeflow-attachment', AttachmentBlockComponent);
}
