import { CitationCard } from './citation';

export * from './citation';

export function effects() {
  customElements.define('bridgeflow-citation-card', CitationCard);
}
