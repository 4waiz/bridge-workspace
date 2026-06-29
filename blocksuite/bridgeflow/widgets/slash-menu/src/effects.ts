import { BRIDGEFLOW_SLASH_MENU_WIDGET } from './consts';
import { InnerSlashMenu, SlashMenu } from './slash-menu-popover';
import { BridgeFlowSlashMenuWidget } from './widget';

export function effects() {
  customElements.define(BRIDGEFLOW_SLASH_MENU_WIDGET, BridgeFlowSlashMenuWidget);
  customElements.define('bridgeflow-slash-menu', SlashMenu);
  customElements.define('inner-slash-menu', InnerSlashMenu);
}

declare global {
  interface HTMLElementTagNameMap {
    [BRIDGEFLOW_SLASH_MENU_WIDGET]: BridgeFlowSlashMenuWidget;
  }
}
