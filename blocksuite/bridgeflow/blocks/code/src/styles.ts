import { scrollbarStyle } from '@blocksuite/bridgeflow-shared/styles';
import { unsafeCSSVarV2 } from '@blocksuite/bridgeflow-shared/theme';
import { css } from 'lit';

export const codeBlockStyles = css`
  bridgeflow-code {
    display: block;
  }

  .bridgeflow-code-block-container {
    font-size: var(--affine-font-xs);
    line-height: var(--affine-line-height);
    position: relative;
    padding: 32px 20px;
    background: var(--affine-background-code-block);
    border-radius: 10px;
    box-sizing: border-box;
  }

  .bridgeflow-code-block-container.mobile {
    padding: 12px;
  }

  .bridgeflow-code-block-container.highlight-comment {
    outline: 2px solid ${unsafeCSSVarV2('block/comment/highlightUnderline')};
  }

  ${scrollbarStyle('.bridgeflow-code-block-container rich-text')}

  /* In Chromium 121+, non-auto scrollbar-width/color override ::-webkit-scrollbar styles. */
  @supports not selector(::-webkit-scrollbar) {
    .bridgeflow-code-block-container rich-text {
      scrollbar-width: thin;
      scrollbar-color: ${unsafeCSSVarV2('icon/secondary', '#b1b1b1')}
        transparent;
      scrollbar-gutter: stable both-edges;
    }
  }

  .bridgeflow-code-block-container .inline-editor {
    font-family: var(--affine-font-code-family);
    font-variant-ligatures: none;
  }

  .bridgeflow-code-block-container v-line {
    position: relative;
    display: inline-grid !important;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .bridgeflow-code-block-container.disable-line-numbers v-line {
    grid-template-columns: unset;
  }

  .bridgeflow-code-block-container div:has(> v-line) {
    display: grid;
  }

  .bridgeflow-code-block-container .line-number {
    position: sticky;
    text-align: left;
    padding-right: 12px;
    width: 32px;
    word-break: break-word;
    white-space: nowrap;
    left: -0.5px;
    z-index: 1;
    background: var(--affine-background-code-block);
    font-size: var(--affine-font-xs);
    line-height: var(--affine-line-height);
    color: var(--affine-text-secondary);
    box-sizing: border-box;
    user-select: none;
  }

  .bridgeflow-code-block-container.disable-line-numbers .line-number {
    display: none;
  }

  bridgeflow-code .bridgeflow-code-block-preview {
    padding: 12px;
  }
`;
