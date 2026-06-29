import { ViewDropdownMenu } from './dropdown-menu';

export * from './dropdown-menu';

export function effects() {
  customElements.define('bridgeflow-view-dropdown-menu', ViewDropdownMenu);
}
