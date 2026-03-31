import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const createNewButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  height: 36,
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  transition: 'all 0.15s ease',
  background: '#FF6A31',
  color: '#FFFFFF',
  selectors: {
    '&:hover': {
      background: '#E85A24',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(255, 106, 49, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: 'none',
    },
    '&:focus-visible': {
      outline: '2px solid #FF6A31',
      outlineOffset: 2,
    },
  },
});

export const createNewButtonIcon = style({
  fontSize: 16,
  display: 'flex',
  alignItems: 'center',
});

export const createNewButtonArrow = style({
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  marginLeft: -2,
  opacity: 0.8,
});

export const menuContent = style({
  width: 260,
  padding: '6px',
  maxHeight: 'min(520px, calc(100vh - 200px))',
  overflowY: 'auto',
});

export const menuSection = style({
  paddingTop: 4,
  paddingBottom: 4,
});

export const menuSectionLabel = style({
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: cssVarV2('text/tertiary'),
  padding: '6px 12px 4px',
  userSelect: 'none',
});

export const menuDivider = style({
  height: 1,
  background: cssVarV2('layer/insideBorder/border'),
  margin: '4px 8px',
});

export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '7px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'background 0.1s ease',
  userSelect: 'none',
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left',
  color: 'inherit',
  selectors: {
    '&:hover': {
      background: cssVarV2('layer/background/hoverOverlay'),
    },
    '&:focus-visible': {
      outline: `2px solid ${cssVarV2('button/primary')}`,
      outlineOffset: -2,
    },
    '&[data-disabled="true"]': {
      opacity: 0.4,
      cursor: 'default',
      pointerEvents: 'none',
    },
  },
});

export const menuItemIcon = style({
  fontSize: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 8,
  flexShrink: 0,
});

export const menuItemContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  flex: 1,
  minWidth: 0,
});

export const menuItemLabel = style({
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '20px',
  color: cssVarV2('text/primary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const menuItemDescription = style({
  fontSize: 12,
  lineHeight: '16px',
  color: cssVarV2('text/tertiary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const menuItemBadge = style({
  fontSize: 10,
  fontWeight: 600,
  lineHeight: '14px',
  padding: '1px 5px',
  borderRadius: 4,
  background: cssVarV2('layer/background/hoverOverlay'),
  color: cssVarV2('text/tertiary'),
  flexShrink: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
});

export const menuItemKeyboard = style({
  fontSize: 12,
  color: cssVarV2('text/tertiary'),
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
});

export const kbdKey = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 18,
  height: 18,
  padding: '0 4px',
  borderRadius: 3,
  fontSize: 11,
  fontWeight: 500,
  fontFamily: 'inherit',
  background: cssVarV2('layer/background/secondary'),
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  color: cssVarV2('text/tertiary'),
});
