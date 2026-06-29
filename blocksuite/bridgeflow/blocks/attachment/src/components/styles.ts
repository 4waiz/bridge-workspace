import { fontXSStyle, panelBaseStyle } from '@blocksuite/bridgeflow-shared/styles';
import { css } from 'lit';

export const renameStyles = css`
  ${panelBaseStyle('.bridgeflow-attachment-rename-container')}
  .bridgeflow-attachment-rename-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 320px;
    gap: 12px;
    padding: 12px;
    z-index: var(--bridgeflow-z-index-popover);
  }

  .bridgeflow-attachment-rename-input-wrapper {
    display: flex;
    min-width: 280px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 10px;
    background: var(--bridgeflow-white-10);
    border-radius: 4px;
    border: 1px solid var(--bridgeflow-border-color);
  }

  .bridgeflow-attachment-rename-input-wrapper:focus-within {
    border-color: var(--bridgeflow-blue-700);
    box-shadow: var(--bridgeflow-active-shadow);
  }

  .bridgeflow-attachment-rename-input-wrapper input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--bridgeflow-text-primary-color);
  }
  ${fontXSStyle('.bridgeflow-attachment-rename-input-wrapper input')}

  .bridgeflow-attachment-rename-input-wrapper input::placeholder {
    color: var(--bridgeflow-placeholder-color);
  }

  .bridgeflow-attachment-rename-extension {
    font-size: var(--bridgeflow-font-xs);
    color: var(--bridgeflow-text-secondary-color);
  }

  .bridgeflow-attachment-rename-overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--bridgeflow-z-index-popover);
  }
`;

export const styles = css`
  :host {
    z-index: 1;
  }
`;
