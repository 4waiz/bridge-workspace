import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';
export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '8px',
  fontSize: cssVar('fontSm'),
  width: '100%',
  height: '34px',
  userSelect: 'none',
  cursor: 'pointer',
  padding: '0 10px',
  position: 'relative',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  background: cssVarV2('layer/background/hoverOverlay'),
  transition: 'all 0.15s ease',
  color: cssVarV2('text/tertiary'),
  ':hover': {
    background: cssVarV2('layer/background/secondary'),
  },
});
export const icon = style({
  marginRight: '8px',
  color: cssVarV2('icon/tertiary'),
  fontSize: '20px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
});
export const spacer = style({
  flex: 1,
});
export const shortcutHint = style({
  color: cssVarV2('text/tertiary'),
  fontSize: cssVar('fontBase'),
});
export const quickSearchBarEllipsisStyle = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 13,
});
