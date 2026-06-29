import { unsafeCSSVar, unsafeCSSVarV2 } from '@blocksuite/bridgeflow-shared/theme';
import { baseTheme } from '@toeverything/theme';
import { css, unsafeCSS } from 'lit';

export const styles = css`
  bookmark-card {
    display: block;
    height: 100%;
    width: 100%;
  }

  .bridgeflow-bookmark-card {
    container: bridgeflow-bookmark-card / inline-size;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    width: 100%;

    border-radius: 8px;
    border: 1px solid ${unsafeCSSVarV2('layer/background/tertiary')};

    background: ${unsafeCSSVarV2('layer/background/primary')};
    user-select: none;
  }

  .bridgeflow-bookmark-content {
    width: calc(100% - 204px);
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-self: stretch;
    gap: 4px;
    padding: 12px;
  }

  .bridgeflow-bookmark-content-title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;

    align-self: stretch;
  }

  .bridgeflow-bookmark-content-title-icon {
    display: flex;
    width: 16px;
    height: 16px;
    justify-content: center;
    align-items: center;
  }

  .bridgeflow-bookmark-content-title-icon img,
  .bridgeflow-bookmark-content-title-icon object,
  .bridgeflow-bookmark-content-title-icon svg {
    width: 16px;
    height: 16px;
    fill: var(--bridgeflow-background-primary-color);
  }

  .bridgeflow-bookmark-content-title-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--bridgeflow-text-primary-color);

    font-family: var(--bridgeflow-font-family);
    font-size: var(--bridgeflow-font-sm);
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }

  .bridgeflow-bookmark-content-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    flex-grow: 1;

    white-space: normal;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--bridgeflow-text-primary-color);

    font-family: var(--bridgeflow-font-family);
    font-size: var(--bridgeflow-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  .bridgeflow-bookmark-content-url {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    width: max-content;
    max-width: 100%;
  }

  .bridgeflow-bookmark-content-url > span {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    word-break: break-all;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--bridgeflow-text-secondary-color);

    font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    font-size: var(--bridgeflow-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  .bridgeflow-bookmark-content-url:hover > span {
    color: var(--bridgeflow-link-color);
  }
  .bridgeflow-bookmark-content-url:hover {
    fill: var(--bridgeflow-link-color);
  }

  .bridgeflow-bookmark-content-url-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 20px;
  }
  .bridgeflow-bookmark-content-url-icon {
    height: 12px;
    width: 12px;
    color: ${unsafeCSSVar('iconSecondary')};
  }

  .bridgeflow-bookmark-banner {
    margin: 12px 12px 0px 0px;
    width: 204px;
    max-width: 100%;
    height: 102px;
  }

  .bridgeflow-bookmark-banner img,
  .bridgeflow-bookmark-banner object,
  .bridgeflow-bookmark-banner svg {
    width: 204px;
    max-width: 100%;
    height: 102px;
    object-fit: cover;
    border-radius: 4px;
  }

  .bridgeflow-bookmark-card.comment-highlighted {
    outline: 2px solid ${unsafeCSSVarV2('block/comment/highlightUnderline')};
  }

  .bridgeflow-bookmark-card.loading {
    .bridgeflow-bookmark-content-title-text {
      color: var(--bridgeflow-placeholder-color);
    }
  }

  .bridgeflow-bookmark-card.error {
    .bridgeflow-bookmark-content-description {
      color: var(--bridgeflow-placeholder-color);
    }
  }

  .bridgeflow-bookmark-card.selected {
    .bridgeflow-bookmark-content-url > span {
      color: var(--bridgeflow-link-color);
    }
    .bridgeflow-bookmark-content-url .bridgeflow-bookmark-content-url-icon {
      color: var(--bridgeflow-link-color);
    }
  }

  .bridgeflow-bookmark-card.list {
    .bridgeflow-bookmark-content {
      width: 100%;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .bridgeflow-bookmark-content-title {
      width: calc(100% - 204px);
    }

    .bridgeflow-bookmark-content-url {
      width: 204px;
      justify-content: flex-end;
    }

    .bridgeflow-bookmark-content-description {
      display: none;
    }

    .bridgeflow-bookmark-banner {
      display: none;
    }
  }

  .bridgeflow-bookmark-card.vertical {
    flex-direction: column-reverse;
    height: 100%;

    .bridgeflow-bookmark-content {
      width: 100%;
    }

    .bridgeflow-bookmark-content-description {
      -webkit-line-clamp: 6;
      max-height: 120px;
    }

    .bridgeflow-bookmark-content-url-wrapper {
      max-width: fit-content;
      display: flex;
      align-items: flex-end;
      flex-grow: 1;
      cursor: pointer;
    }

    .bridgeflow-bookmark-banner {
      width: 340px;
      height: 170px;
      margin-left: 12px;
    }

    .bridgeflow-bookmark-banner img,
    .bridgeflow-bookmark-banner object,
    .bridgeflow-bookmark-banner svg {
      width: 340px;
      height: 170px;
    }
  }

  .bridgeflow-bookmark-card.cube {
    .bridgeflow-bookmark-content {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    }

    .bridgeflow-bookmark-content-title {
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .bridgeflow-bookmark-content-title-text {
      -webkit-line-clamp: 2;
    }

    .bridgeflow-bookmark-content-description {
      display: none;
    }

    .bridgeflow-bookmark-banner {
      display: none;
    }
  }

  @container bridgeflow-bookmark-card (width < 375px) {
    .bridgeflow-bookmark-content {
      width: 100%;
    }
    .bridgeflow-bookmark-card:not(.edgeless) .bridgeflow-bookmark-banner {
      display: none;
    }
  }
`;
