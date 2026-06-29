import { css } from 'lit';

export const styles = css`
  .bridgeflow-block-component.border.light .selected-style {
    border-radius: 8px;
    box-shadow: 0px 0px 0px 1px var(--affine-brand-color);
  }
  .bridgeflow-block-component.border.dark .selected-style {
    border-radius: 8px;
    box-shadow: 0px 0px 0px 1px var(--affine-brand-color);
  }
  @media print {
    .bridgeflow-block-component.border.light .selected-style,
    .bridgeflow-block-component.border.dark .selected-style {
      box-shadow: none;
    }
  }
`;
