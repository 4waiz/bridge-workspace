import { OpenDocDropdownMenu } from './dropdown-menu';

export * from './dropdown-menu';

export function effects() {
  customElements.define('bridgeflow-open-doc-dropdown-menu', OpenDocDropdownMenu);
}
