import type { StyleInfo } from 'lit/directives/style-map.js';

import type { BridgeFlowTextAttributes } from '../types';

export function bridgeflowTextStyles(
  props: BridgeFlowTextAttributes,
  override?: Readonly<StyleInfo>
): StyleInfo {
  let textDecorations = '';
  if (props.underline) {
    textDecorations += 'underline';
  }
  if (props.strike) {
    textDecorations += ' line-through';
  }

  let inlineCodeStyle = {};
  if (props.code) {
    inlineCodeStyle = {
      'font-family': 'var(--bridgeflow-font-code-family)',
      background: 'var(--bridgeflow-background-code-block)',
      border: '1px solid var(--bridgeflow-border-color)',
      'border-radius': '4px',
      color: 'var(--bridgeflow-text-primary-color)',
      'font-variant-ligatures': 'none',
      'vertical-align': 'bottom',
      'line-height': 'inherit',
    };
  }

  return {
    'font-weight': props.bold ? 'bolder' : 'inherit',
    'font-style': props.italic ? 'italic' : 'normal',
    'background-color': props.background ? props.background : undefined,
    color: props.color ? props.color : undefined,
    'text-decoration': textDecorations.length > 0 ? textDecorations : 'none',
    ...inlineCodeStyle,
    ...override,
  };
}
