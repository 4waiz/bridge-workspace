import { CaptionedBlockComponent } from '@blocksuite/bridgeflow-components/caption';
import type { DividerBlockModel } from '@blocksuite/bridgeflow-model';
import { BLOCK_CHILDREN_CONTAINER_PADDING_LEFT } from '@blocksuite/bridgeflow-shared/consts';
import { BlockSelection } from '@blocksuite/std';
import { html } from 'lit';

import { dividerBlockStyles } from './styles.js';

export class DividerBlockComponent extends CaptionedBlockComponent<DividerBlockModel> {
  static override styles = dividerBlockStyles;

  override connectedCallback() {
    super.connectedCallback();

    this.contentEditable = 'false';

    this.handleEvent('click', () => {
      this.host.selection.setGroup('note', [
        this.host.selection.create(BlockSelection, {
          blockId: this.blockId,
        }),
      ]);
    });
  }

  override renderBlock() {
    const children = html`<div
      class="bridgeflow-block-children-container"
      style="padding-left: ${BLOCK_CHILDREN_CONTAINER_PADDING_LEFT}px"
    >
      ${this.renderChildren(this.model)}
    </div>`;

    return html`
      <div class="bridgeflow-divider-block-container">
        <hr />

        ${children}
      </div>
    `;
  }

  override accessor useZeroWidth = true;
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-divider': DividerBlockComponent;
  }
}
