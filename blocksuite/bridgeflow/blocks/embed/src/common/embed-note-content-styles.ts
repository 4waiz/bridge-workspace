import { css } from 'lit';

export const embedNoteContentStyles = css`
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-divider,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-divider > * {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-list {
    margin-top: 4px !important;
    margin-bottom: 4px !important;
    padding: 0 2px;
  }
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph *,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-list * {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    padding-top: 0;
    padding-bottom: 0;
    line-height: 20px;
    font-size: var(--affine-font-xs);
    font-weight: 400;
  }
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-list .bridgeflow-list-block__prefix {
    height: 20px;
  }
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph .quote {
    padding-left: 15px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h1),
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h2),
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h3),
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h4),
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h5),
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h6) {
    margin-top: 6px !important;
    margin-bottom: 4px !important;
    padding: 0 2px;
  }
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h1) *,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h2) *,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h3) *,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h4) *,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h5) *,
  .bridgeflow-embed-doc-content-note-blocks bridgeflow-paragraph:has(.h6) * {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    padding-top: 0;
    padding-bottom: 0;
    line-height: 20px;
    font-size: var(--affine-font-xs);
    font-weight: 600;
  }

  .bridgeflow-embed-doc-content-note-blocks inline-comment {
    background-color: unset !important;
    border-bottom: unset !important;
  }

  .bridgeflow-embed-linked-doc-block.horizontal {
    bridgeflow-paragraph,
    bridgeflow-list {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      max-height: 40px;
      overflow: hidden;
      display: flex;
    }
    bridgeflow-paragraph .quote {
      padding-top: 4px;
      padding-bottom: 4px;
      height: 28px;
    }
    bridgeflow-paragraph .quote::after {
      height: 20px;
      margin-top: 4px !important;
      margin-bottom: 4px !important;
    }
  }
`;
