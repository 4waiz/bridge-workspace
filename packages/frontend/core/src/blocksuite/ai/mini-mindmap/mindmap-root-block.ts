import type { RootBlockModel } from '@blocksuite/bridgeflow/model';
import { BlockComponent } from '@blocksuite/bridgeflow/std';
import { html } from 'lit';

export class MindmapRootBlock extends BlockComponent<RootBlockModel> {
  override render() {
    return html`
      <style>
        .bridgeflow-mini-mindmap-root {
          display: block;
          width: 100%;
          height: 100%;

          background-size: 20px 20px;
          background-color: var(--bridgeflow-background-primary-color);
          background-image: radial-gradient(
            var(--bridgeflow-edgeless-grid-color) 1px,
            var(--bridgeflow-background-primary-color) 1px
          );
        }
      </style>
      <div class="bridgeflow-mini-mindmap-root">
        ${this.host.renderChildren(this.model)}
      </div>
    `;
  }
}
