import { effects as ParagraphHeadingIconEffects } from './heading-icon.js';
import { ParagraphBlockComponent } from './paragraph-block.js';

export function effects() {
  ParagraphHeadingIconEffects();
  customElements.define('bridgeflow-paragraph', ParagraphBlockComponent);
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-paragraph': ParagraphBlockComponent;
  }
}
