import { fontSMStyle, panelBaseStyle } from '@blocksuite/bridgeflow-shared/styles';
import { css } from 'lit';

const editLinkStyle = css`
  .bridgeflow-link-edit-popover {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas:
      'text-area .'
      'link-area btn';
    justify-items: center;
    align-items: center;
    width: 320px;
    gap: 8px 12px;
    padding: 8px;
    box-sizing: content-box;
  }

  ${fontSMStyle('.bridgeflow-link-edit-popover label')}
  .bridgeflow-link-edit-popover label {
    box-sizing: border-box;
    color: var(--affine-icon-color);
    font-weight: 400;
  }

  ${fontSMStyle('.bridgeflow-link-edit-popover input')}
  .bridgeflow-link-edit-popover input {
    color: inherit;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--affine-text-primary-color);
  }
  .bridgeflow-link-edit-popover input::placeholder {
    color: var(--affine-placeholder-color);
  }
  input:focus {
    outline: none;
  }
  .bridgeflow-link-edit-popover input:focus ~ label,
  .bridgeflow-link-edit-popover input:active ~ label {
    color: var(--affine-primary-color);
  }

  .bridgeflow-edit-area {
    width: 280px;
    padding: 4px 10px;
    display: grid;
    gap: 8px;
    grid-template-columns: 26px auto;
    grid-template-rows: repeat(1, 1fr);
    grid-template-areas: 'label input';
    user-select: none;
    box-sizing: border-box;

    border: 1px solid var(--affine-border-color);
    box-sizing: border-box;

    outline: none;
    border-radius: 4px;
    background: transparent;
  }
  .bridgeflow-edit-area:focus-within {
    border-color: var(--affine-blue-700);
    box-shadow: var(--affine-active-shadow);
  }

  .bridgeflow-edit-area.text {
    grid-area: text-area;
  }

  .bridgeflow-edit-area.link {
    grid-area: link-area;
  }

  .bridgeflow-edit-label {
    grid-area: label;
  }

  .bridgeflow-edit-input {
    grid-area: input;
  }

  .bridgeflow-confirm-button {
    grid-area: btn;
    user-select: none;
  }
`;

export const linkPopupStyle = css`
  :host {
    box-sizing: border-box;
  }

  .mock-selection {
    position: absolute;
    background-color: rgba(35, 131, 226, 0.28);
  }

  ${panelBaseStyle('.popover-container')}
  .popover-container {
    z-index: var(--affine-z-index-popover);
    animation: bridgeflow-popover-fade-in 0.2s ease;
    position: absolute;
  }

  @keyframes bridgeflow-popover-fade-in {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .overlay-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--affine-z-index-popover);
  }

  .mock-selection-container {
    pointer-events: none;
  }

  .bridgeflow-link-popover.create {
    display: flex;
    gap: 12px;
    padding: 8px;

    color: var(--affine-text-primary-color);
  }

  .bridgeflow-link-popover-input {
    min-width: 280px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 10px;
    background: var(--affine-white-10);
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--affine-border-color);
    color: var(--affine-text-primary-color);
  }
  ${fontSMStyle('.bridgeflow-link-popover-input')}
  .bridgeflow-link-popover-input::placeholder {
    color: var(--affine-placeholder-color);
  }
  .bridgeflow-link-popover-input:focus {
    border-color: var(--affine-blue-700);
    box-shadow: var(--affine-active-shadow);
  }

  ${editLinkStyle}
`;
