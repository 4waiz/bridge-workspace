import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const header = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
});

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
});

export const viewToggle = style({
  backgroundColor: 'transparent',
});
export const viewToggleItem = style({
  padding: 0,
  fontSize: 16,
  width: 24,
  color: cssVarV2.icon.primary,
  selectors: {
    '&[data-state=checked]': {
      color: cssVarV2.icon.primary,
    },
  },
});

export const newPageButtonLabel = style({
  fontSize: '12px',
  color: cssVarV2.text.primary,
  fontWeight: 500,
});

export const createButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '18px',
  background: '#FF6A31',
  color: '#FFFFFF',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      background: '#E85A24',
    },
    '&:focus-visible': {
      outline: '2px solid #FF6A31',
      outlineOffset: 2,
    },
  },
});

export const createButtonIcon = style({
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
});
