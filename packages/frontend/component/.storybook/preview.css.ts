import { globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
  margin: 0,
  padding: 0,
});

globalStyle('body', {
  color: 'var(--bridgeflow-text-primary-color)',
  fontFamily: 'var(--bridgeflow-font-family)',
  fontSize: 'var(--bridgeflow-font-base)',
  lineHeight: 'var(--bridgeflow-font-height)',
  backgroundColor: 'var(--bridgeflow-background-primary-color)',
});

globalStyle('.docs-story', {
  backgroundColor: 'var(--bridgeflow-background-primary-color)',
});

globalStyle('body.sb-main-fullscreen', {
  overflowY: 'auto',
});
