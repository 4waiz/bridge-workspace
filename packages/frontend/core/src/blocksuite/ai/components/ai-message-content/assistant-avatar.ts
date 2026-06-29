import { BRAND_AI_NAME } from '@bridgeflow/component/brand';
import { AIStarIconWithAnimation } from '@blocksuite/bridgeflow/components/icons';
import { ShadowlessElement } from '@blocksuite/bridgeflow/std';
import { AiIcon } from '@blocksuite/icons/lit';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';

import type { ChatStatus } from '../ai-chat-messages';

const BridgeFlowAvatarIcon = AiIcon({
  width: '20px',
  height: '20px',
  style: 'color: var(--affine-primary-color)',
});

export class AssistantAvatar extends ShadowlessElement {
  @property({ attribute: 'data-status', reflect: true })
  accessor status: ChatStatus = 'idle';

  static override styles = css`
    chat-assistant-avatar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `;

  protected override render() {
    return html`${this.status === 'transmitting'
      ? AIStarIconWithAnimation
      : BridgeFlowAvatarIcon}
    ${BRAND_AI_NAME}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-assistant-avatar': AssistantAvatar;
  }
}
