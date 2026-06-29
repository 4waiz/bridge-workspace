import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

// -- EDGE design tokens --
const EDGE_ORANGE = '#f15a29';
const EDGE_ORANGE_GRAD = 'linear-gradient(135deg, #ff8f3f 0%, #f15a29 100%)';
const SOFT_TINT = 'rgba(241, 90, 41, 0.06)';
const CARD_SHADOW = '0 1px 2px rgba(17, 20, 24, 0.04)';
const CARD_SHADOW_HOVER = '0 12px 32px rgba(17, 20, 24, 0.10)';

export const homeContainer = style({
  width: '100%',
  height: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  background: `radial-gradient(1200px 480px at 80% -10%, ${SOFT_TINT}, transparent 60%)`,
});

export const homeInner = style({
  maxWidth: 1180,
  width: '100%',
  margin: '0 auto',
  padding: '44px 48px 72px',
  display: 'flex',
  flexDirection: 'column',
  gap: 44,
  '@media': {
    '(max-width: 768px)': {
      padding: '24px 20px 48px',
      gap: 32,
    },
  },
});

// -- Command-center header --

export const welcomeSection = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 24,
  flexWrap: 'wrap',
});

export const welcomeText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const eyebrow = style({
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: EDGE_ORANGE,
});

export const welcomeTitle = style({
  fontSize: 36,
  fontWeight: 700,
  lineHeight: '42px',
  color: cssVarV2('text/primary'),
  letterSpacing: '-0.8px',
  '@media': {
    '(max-width: 768px)': {
      fontSize: 26,
      lineHeight: '32px',
    },
  },
});

export const welcomeSubtitle = style({
  fontSize: 15,
  lineHeight: '22px',
  color: cssVarV2('text/secondary'),
  maxWidth: 560,
});

export const welcomeActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
});

export const primaryAction = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 40,
  padding: '0 18px',
  borderRadius: 10,
  border: 'none',
  background: EDGE_ORANGE_GRAD,
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(241, 90, 41, 0.28)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 12px 26px rgba(241, 90, 41, 0.34)',
      filter: 'brightness(1.03)',
    },
    '&:active': { transform: 'translateY(0)' },
  },
});

export const primaryActionIcon = style({
  display: 'inline-flex',
  fontSize: 18,
  alignItems: 'center',
});

export const secondaryAction = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: 40,
  padding: '0 16px',
  borderRadius: 10,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  color: cssVarV2('text/primary'),
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: EDGE_ORANGE,
      color: EDGE_ORANGE,
    },
  },
});

// -- Sections --

export const sectionWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  minWidth: 0,
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
});

export const sectionTitle = style({
  fontSize: 18,
  fontWeight: 700,
  lineHeight: '24px',
  color: cssVarV2('text/primary'),
  letterSpacing: '-0.3px',
});

export const sectionAction = style({
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '18px',
  color: EDGE_ORANGE,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: '4px 8px',
  borderRadius: 6,
  transition: 'background 0.15s',
  selectors: {
    '&:hover': { background: SOFT_TINT },
  },
});

// -- Create-new grid --

export const quickStartGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 14,
  '@media': {
    '(max-width: 1000px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
    '(max-width: 700px)': { gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  },
});

export const quickStartCard = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 12,
  padding: '18px 18px 16px',
  borderRadius: 16,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  boxShadow: CARD_SHADOW,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s',
  userSelect: 'none',
  overflow: 'hidden',
  selectors: {
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: CARD_SHADOW_HOVER,
      borderColor: 'transparent',
    },
    '&:active': { transform: 'translateY(-1px)' },
    '&:focus-visible': { outline: `2px solid ${EDGE_ORANGE}`, outlineOffset: 2 },
  },
});

export const quickStartIcon = style({
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 46,
  height: 46,
  borderRadius: 13,
});

export const quickStartLabel = style({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '18px',
  color: cssVarV2('text/primary'),
});

export const quickStartHint = style({
  fontSize: 12,
  lineHeight: '16px',
  color: cssVarV2('text/tertiary'),
  marginTop: -6,
});

// -- Templates --

export const templatesRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 16,
  '@media': {
    '(max-width: 1000px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
    '(max-width: 700px)': { gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  },
});

export const templateCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 14,
  borderRadius: 16,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  boxShadow: CARD_SHADOW,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s',
  userSelect: 'none',
  selectors: {
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: CARD_SHADOW_HOVER,
      borderColor: 'transparent',
    },
    '&:focus-visible': { outline: `2px solid ${EDGE_ORANGE}`, outlineOffset: 2 },
  },
});

export const templatePreview = style({
  position: 'relative',
  width: '100%',
  height: 96,
  borderRadius: 11,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundImage:
        'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
      backgroundSize: '12px 12px',
      opacity: 0.6,
    },
  },
});

export const templatePreviewIcon = style({
  position: 'relative',
  fontSize: 34,
  display: 'flex',
});

export const templateCardTitle = style({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '19px',
  color: cssVarV2('text/primary'),
});

export const templateCardDescription = style({
  fontSize: 12,
  lineHeight: '17px',
  color: cssVarV2('text/tertiary'),
  flex: 1,
});

export const templateUses = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11,
  fontWeight: 500,
  color: cssVarV2('text/secondary'),
});

export const templateIconSmall = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
  borderRadius: 5,
  fontSize: 11,
});

// -- Recent boards --

export const recentGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 16,
  '@media': {
    '(max-width: 1000px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
    '(max-width: 640px)': { gridTemplateColumns: '1fr' },
  },
});

export const recentCard = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 14,
  borderRadius: 16,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  boxShadow: CARD_SHADOW,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s',
  userSelect: 'none',
  overflow: 'hidden',
  selectors: {
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: CARD_SHADOW_HOVER,
      borderColor: 'transparent',
    },
    '&:focus-visible': { outline: `2px solid ${EDGE_ORANGE}`, outlineOffset: 2 },
  },
});

export const recentThumb = style({
  position: 'relative',
  width: '100%',
  height: 84,
  borderRadius: 11,
  background:
    'linear-gradient(135deg, rgba(241,90,41,0.10), rgba(56,132,255,0.08))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundImage:
        'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
      backgroundSize: '12px 12px',
    },
  },
});

export const recentThumbIcon = style({
  position: 'relative',
  fontSize: 28,
  color: cssVarV2('icon/primary'),
  display: 'flex',
});

export const recentBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 0,
});

export const recentCardTitle = style({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  color: cssVarV2('text/primary'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const recentCardMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  fontSize: 12,
  lineHeight: '16px',
  color: cssVarV2('text/tertiary'),
});

export const recentTag = style({
  fontSize: 11,
  fontWeight: 600,
  color: EDGE_ORANGE,
  background: SOFT_TINT,
  padding: '2px 8px',
  borderRadius: 999,
});

export const recentDot = style({
  width: 3,
  height: 3,
  borderRadius: '50%',
  background: cssVarV2('text/disable'),
  flexShrink: 0,
});

export const avatarCluster = style({
  display: 'flex',
  alignItems: 'center',
});

export const avatar = style({
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  fontWeight: 600,
  color: '#fff',
  border: `2px solid ${cssVarV2('layer/background/primary')}`,
  marginLeft: -8,
  selectors: { '&:first-child': { marginLeft: 0 } },
});

// -- Split row: spaces + AI panel --

export const splitRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr 380px',
  gap: 24,
  alignItems: 'start',
  '@media': {
    '(max-width: 1000px)': { gridTemplateColumns: '1fr' },
  },
});

export const spacesGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 12,
  '@media': {
    '(max-width: 480px)': { gridTemplateColumns: '1fr' },
  },
});

export const spaceCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 14,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  boxShadow: CARD_SHADOW,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.16s ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: CARD_SHADOW_HOVER,
      borderColor: 'transparent',
    },
  },
});

export const spaceDot = style({
  width: 10,
  height: 10,
  borderRadius: 3,
  flexShrink: 0,
});

export const spaceBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
});

export const spaceName = style({
  fontSize: 14,
  fontWeight: 600,
  color: cssVarV2('text/primary'),
});

export const spaceCount = style({
  fontSize: 12,
  color: cssVarV2('text/tertiary'),
});

// -- AI panel --

export const aiPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: 20,
  borderRadius: 18,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: `linear-gradient(180deg, ${SOFT_TINT}, transparent 60%), ${cssVarV2('layer/background/primary')}`,
  boxShadow: CARD_SHADOW,
});

export const aiPanelHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

export const aiPanelBadge = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  borderRadius: 11,
  fontSize: 20,
  color: '#fff',
  background: EDGE_ORANGE_GRAD,
  boxShadow: '0 6px 16px rgba(241, 90, 41, 0.30)',
  flexShrink: 0,
});

export const aiPanelTitle = style({
  fontSize: 15,
  fontWeight: 700,
  color: cssVarV2('text/primary'),
});

export const aiPanelSubtitle = style({
  fontSize: 12,
  color: cssVarV2('text/tertiary'),
});

export const aiRecList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const aiRecCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 12,
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  background: cssVarV2('layer/background/primary'),
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.16s ease',
  selectors: {
    '&:hover': {
      borderColor: EDGE_ORANGE,
      background: SOFT_TINT,
    },
  },
});

export const aiRecIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 9,
  fontSize: 16,
  color: EDGE_ORANGE,
  background: SOFT_TINT,
  flexShrink: 0,
});

export const aiRecBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  minWidth: 0,
});

export const aiRecTitle = style({
  fontSize: 13,
  fontWeight: 600,
  color: cssVarV2('text/primary'),
});

export const aiRecHint = style({
  fontSize: 12,
  color: cssVarV2('text/tertiary'),
});

export const aiRecArrow = style({
  fontSize: 16,
  color: cssVarV2('text/tertiary'),
  flexShrink: 0,
  transition: 'transform 0.16s ease, color 0.16s ease',
  selectors: {
    [`${aiRecCard}:hover &`]: {
      color: EDGE_ORANGE,
      transform: 'translateX(3px)',
    },
  },
});

// -- Empty state --

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  padding: '56px 24px',
  textAlign: 'center',
  borderRadius: 18,
  border: `1px dashed ${cssVarV2('layer/insideBorder/border')}`,
  background: SOFT_TINT,
});

export const emptyIcon = style({
  fontSize: 40,
  color: EDGE_ORANGE,
});

export const emptyText = style({
  fontSize: 14,
  lineHeight: '20px',
  color: cssVarV2('text/secondary'),
  maxWidth: 380,
});

export const emptyAction = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: 38,
  padding: '0 18px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  cursor: 'pointer',
  background: EDGE_ORANGE_GRAD,
  border: 'none',
  borderRadius: 10,
  boxShadow: '0 8px 20px rgba(241, 90, 41, 0.26)',
  transition: 'transform 0.15s ease',
  selectors: {
    '&:hover': { transform: 'translateY(-1px)' },
  },
});
