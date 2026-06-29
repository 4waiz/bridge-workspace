import { unsafeCSSVarV2 } from '@blocksuite/bridgeflow-shared/theme';
import { css } from 'lit';

export const styles = css`
  .bridgeflow-attachment-container {
    border-radius: 8px;
    box-sizing: border-box;
    user-select: none;
    overflow: hidden;
    border: 1px solid ${unsafeCSSVarV2('layer/background/tertiary')};
    background: ${unsafeCSSVarV2('layer/background/primary')};

    &.focused {
      border-color: ${unsafeCSSVarV2('layer/insideBorder/primaryBorder')};
    }
  }

  .bridgeflow-attachment-container.comment-highlighted {
    outline: 2px solid ${unsafeCSSVarV2('block/comment/highlightUnderline')};
  }

  .bridgeflow-attachment-card {
    display: flex;
    gap: 12px;
    padding: 12px;
  }

  .bridgeflow-attachment-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    flex: 1 0 0;
    min-width: 0;
  }

  .truncate {
    align-self: stretch;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .bridgeflow-attachment-content-title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    align-self: stretch;
  }

  .bridgeflow-attachment-content-title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--affine-text-primary-color);
    font-size: 16px;
  }

  .bridgeflow-attachment-content-title-text {
    color: var(--affine-text-primary-color);
    font-family: var(--affine-font-family);
    font-size: var(--affine-font-sm);
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }

  .bridgeflow-attachment-content-description {
    display: flex;
    align-items: center;
    align-self: stretch;
    gap: 8px;
  }

  .bridgeflow-attachment-content-info {
    color: var(--affine-text-secondary-color);
    font-family: var(--affine-font-family);
    font-size: var(--affine-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  .bridgeflow-attachment-content-button {
    display: flex;
    height: 20px;
    align-items: center;
    align-self: stretch;
    gap: 4px;
    white-space: nowrap;
    padding: 0 4px;
    color: ${unsafeCSSVarV2('button/primary')};
    font-family: var(--affine-font-family);
    font-size: var(--affine-font-xs);
    font-style: normal;
    font-weight: 500;
    text-transform: capitalize;
    line-height: 20px;

    svg {
      font-size: 16px;
    }
  }

  .bridgeflow-attachment-banner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bridgeflow-attachment-card.loading {
    .bridgeflow-attachment-content-title-text {
      color: ${unsafeCSSVarV2('text/placeholder')};
    }
  }

  .bridgeflow-attachment-card.error {
    .bridgeflow-attachment-content-title-icon {
      color: ${unsafeCSSVarV2('status/error')};
    }
  }

  .bridgeflow-attachment-card.loading,
  .bridgeflow-attachment-card.error {
    background: ${unsafeCSSVarV2('layer/background/secondary')};
  }

  .bridgeflow-attachment-card.cubeThick {
    flex-direction: column-reverse;

    .bridgeflow-attachment-content {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    }

    .bridgeflow-attachment-banner {
      justify-content: space-between;
    }
  }

  .bridgeflow-attachment-embed-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .bridgeflow-attachment-embed-status {
    position: absolute;
    left: 14px;
    bottom: 64px;
  }

  .bridgeflow-attachment-embed-event-mask {
    position: absolute;
    inset: 0;
  }
`;
