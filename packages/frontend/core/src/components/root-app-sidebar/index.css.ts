import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const workspaceAndUserWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: 'calc(100% + 12px)',
  height: 42,
  paddingRight: 6,
  alignSelf: 'center',
});

export const quickSearch = style({
  width: '100%',
});

export const workspaceWrapper = style({
  width: 0,
  flex: 1,
});

export const bottomContainer = style({
  gap: 8,
});

// -- Sidebar structure --

export const createNewWrapper = style({
  padding: '6px 0 2px',
});

export const searchWrapper = style({
  padding: '2px 0',
});

export const sidebarSectionDivider = style({
  height: 1,
  background: cssVarV2('layer/insideBorder/border'),
  margin: '6px 0',
  opacity: 0.5,
});

export const primaryNav = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '4px 0 2px',
});

export const settingsRow = style({
  paddingTop: 4,
  paddingBottom: 4,
});
