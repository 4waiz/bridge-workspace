import {
  type BridgeFlowCssVariables,
  combinedDarkCssVariables,
  combinedLightCssVariables,
} from '@toeverything/theme';
import { unsafeCSS } from 'lit';

const toolbarColorKeys: Array<keyof BridgeFlowCssVariables> = [
  '--bridgeflow-background-overlay-panel-color',
  '--bridgeflow-v2-layer-background-overlayPanel' as never,
  '--bridgeflow-v2-layer-insideBorder-blackBorder' as never,
  '--bridgeflow-v2-icon-primary' as never,
  '--bridgeflow-background-error-color',
  '--bridgeflow-background-primary-color',
  '--bridgeflow-background-tertiary-color',
  '--bridgeflow-icon-color',
  '--bridgeflow-icon-secondary',
  '--bridgeflow-border-color',
  '--bridgeflow-divider-color',
  '--bridgeflow-text-primary-color',
  '--bridgeflow-hover-color',
  '--bridgeflow-hover-color-filled',
];

export const lightToolbarStyles = (selector: string) => `
  ${selector}[data-app-theme='light'] {
    ${toolbarColorKeys
      .map(key => `${key}: ${unsafeCSS(combinedLightCssVariables[key])};`)
      .join('\n')}
  }
`;

export const darkToolbarStyles = (selector: string) => `
  ${selector}[data-app-theme='dark'] {
    ${toolbarColorKeys
      .map(key => `${key}: ${unsafeCSS(combinedDarkCssVariables[key])};`)
      .join('\n')}
  }
`;
