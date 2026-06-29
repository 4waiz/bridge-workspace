import { EmbedLinkedDocBlockComponent } from './embed-linked-doc-block';
import { EmbedEdgelessLinkedDocBlockComponent } from './embed-linked-doc-block/embed-edgeless-linked-doc-block';
import { EmbedSyncedDocBlockComponent } from './embed-synced-doc-block';
import { EmbedSyncedDocCard } from './embed-synced-doc-block/components/embed-synced-doc-card';
import { EmbedEdgelessSyncedDocBlockComponent } from './embed-synced-doc-block/embed-edgeless-synced-doc-block';

export function effects() {
  customElements.define('bridgeflow-embed-synced-doc-card', EmbedSyncedDocCard);

  customElements.define(
    'bridgeflow-embed-edgeless-linked-doc-block',
    EmbedEdgelessLinkedDocBlockComponent
  );
  customElements.define(
    'bridgeflow-embed-linked-doc-block',
    EmbedLinkedDocBlockComponent
  );

  customElements.define(
    'bridgeflow-embed-edgeless-synced-doc-block',
    EmbedEdgelessSyncedDocBlockComponent
  );
  customElements.define(
    'bridgeflow-embed-synced-doc-block',
    EmbedSyncedDocBlockComponent
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-embed-synced-doc-card': EmbedSyncedDocCard;
    'bridgeflow-embed-synced-doc-block': EmbedSyncedDocBlockComponent;
    'bridgeflow-embed-edgeless-synced-doc-block': EmbedEdgelessSyncedDocBlockComponent;
    'bridgeflow-embed-linked-doc-block': EmbedLinkedDocBlockComponent;
    'bridgeflow-embed-edgeless-linked-doc-block': EmbedEdgelessLinkedDocBlockComponent;
  }
}
