import { BRIDGEFLOW_LINKED_DOC_WIDGET } from './config.js';
import { ImportDoc } from './import-doc/import-doc.js';
import { Loader } from './import-doc/loader.js';
import { BridgeFlowLinkedDocWidget } from './index.js';
import { LinkedDocPopover } from './linked-doc-popover.js';
import { BridgeFlowMobileLinkedDocMenu } from './mobile-linked-doc-menu.js';

export function effects() {
  customElements.define('bridgeflow-linked-doc-popover', LinkedDocPopover);
  customElements.define(BRIDGEFLOW_LINKED_DOC_WIDGET, BridgeFlowLinkedDocWidget);
  customElements.define('import-doc', ImportDoc);
  customElements.define(
    'bridgeflow-mobile-linked-doc-menu',
    BridgeFlowMobileLinkedDocMenu
  );
  customElements.define('loader-element', Loader);
}
