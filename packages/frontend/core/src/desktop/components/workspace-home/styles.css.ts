import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const homeContainer = style({
  width: '100%',
  height: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

export const homeInner = style({
  maxWidth: 1100,
  width: '100%',
  margin: '0 auto',
  padding: '40px 48px 56px',
  display: 'flex',
  flexDirection: 'column',
  gap: 40,
  '@media': {
    '(max-width: 768px)': {
      padding: '24px 20px 40px',
      gap: 28,
    },
  },
});

// -- Welcome header --

export const welcomeSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const welcomeTitle = style({
  fontSize: 32,
  fontWeight: 700,
  lineHeight: '40px',
  color: cssVarV2('text/primary'),
  letterSpacing: '-0.5px',
  '@media': {
    '(max-width: 768px)': {
      fontSize: 24,
      lineHeight: '32px',
    },
  },
});

export const welcomeSubtitle = style({
  fontSize: 15,
  lineHeight: '22px',
  color: cssVarV2('text/secondary'),
  maxWidth: 520,
});

// -- Quick starts / templates section --

export const sectionWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
});

export const sectionTitle = style({
  fontSize: 17,
  fontWeight: 600,
  lineHeight: '24px',
  color: cssVarV2('text/primary'),
});

export const sectionAction = style({
  fontSize: 13,
  fontWeight: 500,
  lineHeight: '18px',
  color: '#FF6A31',
  cursor: 'pointer',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  padding: '4px 8px',
  borderRadius: 6,
  transition: 'all 0.15s',
  selectors: {
    '&:hover': {
      background: 'rgba(255, 106, 49, 0.08)',
    },
  },
});

export const quickStartGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 14,
  '@media': {
    '(max-width: 900px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    '(max-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 10,
    },
  },
});

export const quickStartCard = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  padding: '24px 16px 20px',
  borderRadius: 16,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  userSelect: 'none',
  selectors: {
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      borderColor: 'transparent',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:focus-visible': {
      outline: '2px solid #FF6A31',
      outlineOffset: 2,
    },
  },
});

export const quickStartIcon = style({
  fontSize: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 52,
  height: 52,
  borderRadius: 14,
});

export const quickStartLabel = style({
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '18px',
  color: cssVarV2('text/primary'),
  textAlign: 'center',
});

// -- Templates row --

export const templatesRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 14,
  '@media': {
    '(max-width: 600px)': {
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
    },
  },
});

export const templateCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '20px',
  borderRadius: 14,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  userSelect: 'none',
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
      borderColor: 'transparent',
    },
    '&:focus-visible': {
      outline: '2px solid #FF6A31',
      outlineOffset: 2,
    },
  },
});

export const templateCardIcon = style({
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: 12,
});

export const templateCardTitle = style({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  color: cssVarV2('text/primary'),
});

export const templateCardDescription = style({
  fontSize: 12,
  lineHeight: '17px',
  color: cssVarV2('text/tertiary'),
});

// -- Recent documents section --

export const recentGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 14,
  '@media': {
    '(max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const recentCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: '16px 18px',
  borderRadius: 14,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  userSelect: 'none',
  overflow: 'hidden',
  selectors: {
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      borderColor: 'transparent',
    },
    '&:focus-visible': {
      outline: '2px solid #FF6A31',
      outlineOffset: 2,
    },
  },
});

export const recentCardHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
});

export const recentCardIcon = style({
  fontSize: 20,
  color: cssVarV2('icon/primary'),
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

export const recentCardTitle = style({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  color: cssVarV2('text/primary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
});

export const recentCardPreview = style({
  fontSize: 13,
  lineHeight: '18px',
  color: cssVarV2('text/tertiary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
});

export const recentCardMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  lineHeight: '16px',
  color: cssVarV2('text/tertiary'),
});

export const recentCardDot = style({
  width: 3,
  height: 3,
  borderRadius: '50%',
  background: cssVarV2('text/disable'),
  flexShrink: 0,
});

// -- Tip cards row --

export const tipCardsRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 14,
  '@media': {
    '(max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const tipCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '18px 20px',
  borderRadius: 14,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      borderColor: 'transparent',
    },
  },
});

export const tipCardIcon = style({
  fontSize: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: 12,
  flexShrink: 0,
});

export const tipCardContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  minWidth: 0,
});

export const tipCardTitle = style({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  color: cssVarV2('text/primary'),
});

export const tipCardDescription = style({
  fontSize: 12,
  lineHeight: '17px',
  color: cssVarV2('text/tertiary'),
});

// -- Empty state --

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  padding: '48px 24px',
  textAlign: 'center',
});

export const emptyIcon = style({
  fontSize: 40,
  color: cssVarV2('text/disable'),
});

export const emptyText = style({
  fontSize: 14,
  lineHeight: '20px',
  color: cssVarV2('text/secondary'),
  maxWidth: 360,
});

export const emptyAction = style({
  fontSize: 14,
  fontWeight: 600,
  color: '#FF6A31',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 8,
  transition: 'background 0.15s',
  selectors: {
    '&:hover': {
      background: 'rgba(255, 106, 49, 0.08)',
    },
  },
});
