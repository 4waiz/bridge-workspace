import { style } from '@vanilla-extract/css';
export const editor = style({
  flex: 1,
  selectors: {
    '&.full-screen': {
      vars: {
        '--bridgeflow-editor-width': '100%',
        '--bridgeflow-editor-side-padding': '72px',
      },
    },
  },
  '@media': {
    'screen and (max-width: 800px)': {
      selectors: {
        '&.is-public': {
          vars: {
            '--bridgeflow-editor-width': '100%',
            '--bridgeflow-editor-side-padding': '24px',
          },
        },
      },
    },
  },
});
