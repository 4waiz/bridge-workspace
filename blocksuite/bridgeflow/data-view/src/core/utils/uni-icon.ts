import * as icons from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import { uniMap } from './uni-component/operation.js';
import { createUniComponentFromWebComponent } from './uni-component/uni-component.js';

export class BridgeFlowLitIcon extends ShadowlessElement {
  static override styles = css`
    bridgeflow-lit-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    bridgeflow-lit-icon svg {
      fill: var(--affine-icon-color);
    }
  `;

  protected override render(): unknown {
    const createIcon = icons[this.name] as () => TemplateResult;
    return html`${createIcon?.()}`;
  }

  @property({ attribute: false })
  accessor name!: keyof typeof icons;
}

const litIcon = createUniComponentFromWebComponent<{ name: string }>(
  BridgeFlowLitIcon
);
export const createIcon = (name: keyof typeof icons) => {
  return uniMap(litIcon, () => ({ name }));
};
