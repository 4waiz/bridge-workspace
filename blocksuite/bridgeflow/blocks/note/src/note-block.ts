import type { NoteBlockModel } from '@blocksuite/bridgeflow-model';
import { BlockComponent } from '@blocksuite/std';
import { css, html } from 'lit';

export class NoteBlockComponent extends BlockComponent<NoteBlockModel> {
  static override styles = css`
    .bridgeflow-note-block-container {
      display: flow-root;
    }
    .bridgeflow-note-block-container.selected {
      background-color: var(--affine-hover-color);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
  }

  override renderBlock() {
    return html`
      <div class="bridgeflow-note-block-container">
        <div class="bridgeflow-block-children-container">
          ${this.renderChildren(this.model)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bridgeflow-note': NoteBlockComponent;
  }
}
