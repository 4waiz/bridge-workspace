import { CodeBlockComponent } from './code-block';
import {
  BRIDGEFLOW_CODE_TOOLBAR_WIDGET,
  BridgeFlowCodeToolbarWidget,
} from './code-toolbar';
import { BridgeFlowCodeToolbar } from './code-toolbar/components/code-toolbar';
import { LanguageListButton } from './code-toolbar/components/lang-button';
import { PreviewButton } from './code-toolbar/components/preview-button';
import { BridgeFlowCodeUnit } from './highlight/bridgeflow-code-unit';

export function effects() {
  customElements.define('language-list-button', LanguageListButton);
  customElements.define('bridgeflow-code-toolbar', BridgeFlowCodeToolbar);
  customElements.define(BRIDGEFLOW_CODE_TOOLBAR_WIDGET, BridgeFlowCodeToolbarWidget);
  customElements.define('bridgeflow-code-unit', BridgeFlowCodeUnit);
  customElements.define('bridgeflow-code', CodeBlockComponent);
  customElements.define('preview-button', PreviewButton);
}

declare global {
  interface HTMLElementTagNameMap {
    'language-list-button': LanguageListButton;
    'bridgeflow-code-toolbar': BridgeFlowCodeToolbar;
    'preview-button': PreviewButton;
    [BRIDGEFLOW_CODE_TOOLBAR_WIDGET]: BridgeFlowCodeToolbarWidget;
  }
}
