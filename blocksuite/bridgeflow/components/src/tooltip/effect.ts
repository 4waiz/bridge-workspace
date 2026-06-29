import { Tooltip } from './tooltip.js';

export function effects() {
  if (!customElements.get('bridgeflow-tooltip')) {
    customElements.define('bridgeflow-tooltip', Tooltip);
  }
}
