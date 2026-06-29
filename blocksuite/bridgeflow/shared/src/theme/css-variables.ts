/* CSS variables. You need to handle all places where `CSS variables` are marked. */

import { LINE_COLORS } from '@blocksuite/bridgeflow-model';
import {
  type BridgeFlowCssVariables,
  type BridgeFlowTheme,
  cssVar,
} from '@toeverything/theme';
export { cssVar } from '@toeverything/theme';
import { type BridgeFlowThemeKeyV2, cssVarV2 } from '@toeverything/theme/v2';
import { unsafeCSS } from 'lit';
export { cssVarV2 } from '@toeverything/theme/v2';
export const ColorVariables = [
  '--bridgeflow-brand-color',
  '--bridgeflow-primary-color',
  '--bridgeflow-secondary-color',
  '--bridgeflow-tertiary-color',
  '--bridgeflow-hover-color',
  '--bridgeflow-icon-color',
  '--bridgeflow-icon-secondary',
  '--bridgeflow-border-color',
  '--bridgeflow-divider-color',
  '--bridgeflow-placeholder-color',
  '--bridgeflow-quote-color',
  '--bridgeflow-link-color',
  '--bridgeflow-edgeless-grid-color',
  '--bridgeflow-success-color',
  '--bridgeflow-warning-color',
  '--bridgeflow-error-color',
  '--bridgeflow-processing-color',
  '--bridgeflow-text-emphasis-color',
  '--bridgeflow-text-primary-color',
  '--bridgeflow-text-secondary-color',
  '--bridgeflow-text-disable-color',
  '--bridgeflow-black-10',
  '--bridgeflow-black-30',
  '--bridgeflow-black-50',
  '--bridgeflow-black-60',
  '--bridgeflow-black-80',
  '--bridgeflow-black-90',
  '--bridgeflow-black',
  '--bridgeflow-white-10',
  '--bridgeflow-white-30',
  '--bridgeflow-white-50',
  '--bridgeflow-white-60',
  '--bridgeflow-white-80',
  '--bridgeflow-white-90',
  '--bridgeflow-white',
  '--bridgeflow-background-code-block',
  '--bridgeflow-background-tertiary-color',
  '--bridgeflow-background-processing-color',
  '--bridgeflow-background-error-color',
  '--bridgeflow-background-warning-color',
  '--bridgeflow-background-success-color',
  '--bridgeflow-background-primary-color',
  '--bridgeflow-background-secondary-color',
  '--bridgeflow-background-modal-color',
  '--bridgeflow-background-overlay-panel-color',
  '--bridgeflow-tag-blue',
  '--bridgeflow-tag-green',
  '--bridgeflow-tag-teal',
  '--bridgeflow-tag-white',
  '--bridgeflow-tag-purple',
  '--bridgeflow-tag-red',
  '--bridgeflow-tag-pink',
  '--bridgeflow-tag-yellow',
  '--bridgeflow-tag-orange',
  '--bridgeflow-tag-gray',
  ...LINE_COLORS,
  '--bridgeflow-tooltip',
  '--bridgeflow-blue',
];

export const SizeVariables = [
  '--bridgeflow-font-h-1',
  '--bridgeflow-font-h-2',
  '--bridgeflow-font-h-3',
  '--bridgeflow-font-h-4',
  '--bridgeflow-font-h-5',
  '--bridgeflow-font-h-6',
  '--bridgeflow-font-base',
  '--bridgeflow-font-sm',
  '--bridgeflow-font-xs',
  '--bridgeflow-line-height',
  '--bridgeflow-z-index-modal',
  '--bridgeflow-z-index-popover',
];

export const FontFamilyVariables = [
  '--bridgeflow-font-family',
  '--bridgeflow-font-number-family',
  '--bridgeflow-font-code-family',
];

export const StyleVariables = [
  '--bridgeflow-editor-width',

  '--bridgeflow-theme-mode',
  '--bridgeflow-editor-mode',
  /* --bridgeflow-palette-transparent: special values added for the sake of logical consistency. */
  '--bridgeflow-palette-transparent',

  '--bridgeflow-popover-shadow',
  '--bridgeflow-menu-shadow',
  '--bridgeflow-float-button-shadow',
  '--bridgeflow-shadow-1',
  '--bridgeflow-shadow-2',
  '--bridgeflow-shadow-3',

  '--bridgeflow-paragraph-space',
  '--bridgeflow-popover-radius',
  '--bridgeflow-scale',
  ...SizeVariables,
  ...ColorVariables,
  ...FontFamilyVariables,
] as const;

type VariablesType = typeof StyleVariables;
export type CssVariableName = Extract<
  VariablesType[keyof VariablesType],
  string
>;

export type CssVariablesMap = Record<CssVariableName, string>;

export const unsafeCSSVar = (
  key: keyof BridgeFlowCssVariables | keyof BridgeFlowTheme,
  fallback?: string
) => unsafeCSS(cssVar(key, fallback));

export const unsafeCSSVarV2 = (key: BridgeFlowThemeKeyV2, fallback?: string) =>
  unsafeCSS(cssVarV2(key, fallback));
