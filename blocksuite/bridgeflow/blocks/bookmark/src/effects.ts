import { BookmarkBlockComponent } from './bookmark-block';
import { BookmarkEdgelessBlockComponent } from './bookmark-edgeless-block';
import { BookmarkCard } from './components/bookmark-card';

export function effects() {
  customElements.define(
    'bridgeflow-edgeless-bookmark',
    BookmarkEdgelessBlockComponent
  );
  customElements.define('bridgeflow-bookmark', BookmarkBlockComponent);
  customElements.define('bookmark-card', BookmarkCard);
}
