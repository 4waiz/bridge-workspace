import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  gap: 4,
  alignItems: 'center',
  fontSize: 15,
  lineHeight: '22px',
  fontWeight: 600,
  paddingLeft: 8,
});

export const item = style({
  color: cssVarV2.text.secondary,
  padding: '4px 10px',
  borderRadius: 6,
  transition: 'all 0.15s ease',
  selectors: {
    '&:hover': {
      color: cssVarV2.text.primary,
      background: cssVarV2('layer/background/hoverOverlay'),
    },
    '&[data-active="true"]': {
      color: cssVarV2.text.primary,
      background: cssVarV2('layer/background/hoverOverlay'),
    },
  },
});
