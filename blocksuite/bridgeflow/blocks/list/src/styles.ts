import { css } from 'lit';

export const listPrefix = css`
  .bridgeflow-list-block__prefix {
    display: flex;
    color: var(--affine-blue-700);
    font-size: var(--affine-font-sm);
    user-select: none;
    position: relative;
  }

  .bridgeflow-list-block__numbered {
    min-width: 22px;
    height: 24px;
    margin-left: 2px;
  }

  .bridgeflow-list-block__todo-prefix {
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 24px;
    height: 24px;
    color: var(--affine-icon-color);
  }

  .bridgeflow-list-block__todo-prefix.readonly {
    cursor: default;
  }

  .bridgeflow-list-block__todo-prefix > svg {
    width: 20px;
    height: 20px;
  }
`;

export const listBlockStyles = css`
  bridgeflow-list {
    display: block;
    font-size: var(--affine-font-base);
  }

  bridgeflow-list code {
    font-size: calc(var(--affine-font-base) - 3px);
    padding: 0px 4px 2px;
  }

  .bridgeflow-list-block-container {
    box-sizing: border-box;
    border-radius: 4px;
    position: relative;
  }
  .bridgeflow-list-block-container .bridgeflow-list-block-container {
    margin-top: 0;
  }
  .bridgeflow-list-rich-text-wrapper {
    position: relative;
    display: flex;
  }
  .bridgeflow-list-rich-text-wrapper rich-text {
    flex: 1;
  }

  .bridgeflow-list--checked {
    color: var(--affine-text-secondary-color);
  }

  ${listPrefix}
`;
