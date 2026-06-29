import { SizeDropdownMenu } from './dropdown-menu';

export * from './dropdown-menu';

export function effects() {
  customElements.define('bridgeflow-size-dropdown-menu', SizeDropdownMenu);
}
