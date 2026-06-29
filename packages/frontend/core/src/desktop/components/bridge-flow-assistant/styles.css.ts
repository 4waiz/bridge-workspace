import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const _pulse = keyframes({
  '0%': {
    boxShadow: '0 0 0 0 rgba(255, 86, 34, 0.14)',
  },
  '100%': {
    boxShadow: '0 0 0 12px rgba(255, 86, 34, 0)',
  },
});

const voiceLevel = keyframes({
  '0%': {
    opacity: 0.45,
    transform: 'scaleY(0.45)',
  },
  '100%': {
    opacity: 1,
    transform: 'scaleY(1)',
  },
});

export const shell = style({
  position: 'fixed',
  right: 20,
  bottom: 20,
  zIndex: 80,
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 16,
  '@media': {
    'screen and (max-width: 720px)': {
      right: 16,
      bottom: 16,
      left: 16,
      alignItems: 'stretch',
    },
  },
});

export const panel = style({
  pointerEvents: 'auto',
  width: 360,
  maxWidth: 'calc(100vw - 32px)',
  height: 'min(620px, calc(100vh - 88px))',
  display: 'grid',
  gridTemplateRows: '64px minmax(0, 1fr) auto',
  overflow: 'hidden',
  borderRadius: 20,
  color: '#434b51',
  background: '#f8f6f3',
  border: '1px solid rgba(67, 75, 81, 0.1)',
  boxShadow: '0 16px 36px rgba(67, 75, 81, 0.14)',
  '@media': {
    'screen and (max-width: 720px)': {
      width: '100%',
      maxWidth: '100%',
      height: 'min(78vh, 720px)',
    },
  },
});

globalStyle(`html[data-theme='dark'] ${panel}, [data-theme='dark'] ${panel}`, {
  color: 'rgba(255, 255, 255, 0.92)',
  background: '#1f2428',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 16px 38px rgba(0, 0, 0, 0.28)',
});

export const panelHeader = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: 12,
  padding: '0 14px',
  background: 'linear-gradient(180deg, #ff6a31 0%, #f05b2b 100%)',
  color: '#ffffff',
});

export const titleGroup = style({
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr)',
  gap: 10,
  alignItems: 'center',
  minWidth: 0,
});

export const headerText = style({
  display: 'grid',
  gap: 2,
  minWidth: 0,
});

export const title = style({
  fontSize: 14,
  lineHeight: 1.25,
  fontWeight: 700,
  color: 'inherit',
});

export const subtitle = style({
  fontSize: 11,
  lineHeight: 1.4,
  color: 'rgba(255, 255, 255, 0.78)',
});

export const statusDot = style({
  display: 'none',
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

export const iconButton = style({
  width: 32,
  height: 32,
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.22)',
  background: 'rgba(255, 255, 255, 0.08)',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.16s ease, border-color 0.16s ease',
  selectors: {
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.16)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
  },
});

export const content = style({
  minHeight: 0,
  display: 'contents',
});

export const messages = style({
  minHeight: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 12,
  scrollbarWidth: 'thin',
});

globalStyle(`${messages}::-webkit-scrollbar`, {
  width: 8,
});

globalStyle(`${messages}::-webkit-scrollbar-thumb`, {
  background: 'rgba(67, 75, 81, 0.16)',
  borderRadius: 999,
});

export const assistantRow = style({
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr)',
  gap: 10,
  alignItems: 'start',
});

export const assistantColumn = style({
  display: 'grid',
  gap: 10,
});

export const avatar = style({
  borderRadius: '50%',
});

export const assistantBubble = style({
  maxWidth: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  background: '#ffffff',
  border: '1px solid rgba(67, 75, 81, 0.08)',
});

globalStyle(
  `html[data-theme='dark'] ${assistantBubble}, [data-theme='dark'] ${assistantBubble}`,
  {
    background: '#262c31',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }
);

export const userRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const userBubble = style({
  maxWidth: '78%',
  padding: '12px 14px',
  borderRadius: 14,
  background: 'linear-gradient(180deg, #ff6a31 0%, #f05b2b 100%)',
  color: '#ffffff',
});

export const bubbleMeta = style({
  marginBottom: 6,
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#8b9196',
});

globalStyle(
  `html[data-theme='dark'] ${bubbleMeta}, [data-theme='dark'] ${bubbleMeta}`,
  {
    color: 'rgba(255, 255, 255, 0.52)',
  }
);

export const bubbleText = style({
  fontSize: 13,
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

globalStyle(`${bubbleText} p`, {
  margin: 0,
});

globalStyle(`${bubbleText} p + p`, {
  marginTop: 8,
});

export const quickActions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'flex-start',
});

export const quickAction = style({
  minHeight: 34,
  maxWidth: '100%',
  padding: '0 12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 999,
  border: '1px solid rgba(255, 86, 34, 0.4)',
  background: 'transparent',
  color: '#f05b2b',
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 600,
  cursor: 'pointer',
  transition:
    'background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease',
  selectors: {
    '&:hover': {
      background: 'rgba(255, 86, 34, 0.06)',
    },
  },
});

globalStyle(
  `html[data-theme='dark'] ${quickAction}, [data-theme='dark'] ${quickAction}`,
  {
    color: '#ff8b62',
    border: '1px solid rgba(255, 139, 98, 0.42)',
  }
);

export const keyNotice = style({
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(255, 86, 34, 0.14)',
  background: 'rgba(255, 86, 34, 0.05)',
  fontSize: 12,
  lineHeight: 1.45,
  color: '#697076',
});

globalStyle(
  `html[data-theme='dark'] ${keyNotice}, [data-theme='dark'] ${keyNotice}`,
  {
    color: 'rgba(255, 255, 255, 0.68)',
  }
);

export const chipRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
});

export const chip = style({
  minHeight: 34,
  padding: '0 12px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 600,
  color: '#697076',
  background: '#ffffff',
  border: '1px solid rgba(67, 75, 81, 0.12)',
  borderRadius: 999,
  cursor: 'pointer',
  transition: 'border-color 0.16s ease, color 0.16s ease',
  selectors: {
    '&:hover': {
      color: '#f05b2b',
      borderColor: 'rgba(255, 86, 34, 0.24)',
    },
  },
});

globalStyle(`html[data-theme='dark'] ${chip}, [data-theme='dark'] ${chip}`, {
  color: 'rgba(255, 255, 255, 0.74)',
  background: '#262c31',
  border: '1px solid rgba(255, 255, 255, 0.08)',
});

export const transcript = style({
  padding: '0 12px 8px',
  fontSize: 11,
  lineHeight: 1.45,
  color: '#697076',
});

globalStyle(
  `html[data-theme='dark'] ${transcript}, [data-theme='dark'] ${transcript}`,
  {
    color: 'rgba(255, 255, 255, 0.64)',
  }
);

export const composer = style({
  display: 'grid',
  gap: 8,
  padding: 10,
  borderTop: '1px solid rgba(67, 75, 81, 0.08)',
  background: '#ffffff',
});

globalStyle(
  `html[data-theme='dark'] ${composer}, [data-theme='dark'] ${composer}`,
  {
    background: '#1f2428',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  }
);

export const composerShell = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gridTemplateRows: 'auto auto',
  gap: 8,
  alignItems: 'end',
});

export const textarea = style({
  gridColumn: '1 / -1',
  width: '100%',
  minHeight: 44,
  maxHeight: 96,
  padding: '12px 14px',
  resize: 'none',
  borderRadius: 12,
  border: '1px solid rgba(67, 75, 81, 0.12)',
  background: '#f8f6f3',
  color: '#434b51',
  outline: 'none',
  fontSize: 13,
  lineHeight: 1.45,
  fontFamily: 'inherit',
  transition: 'border-color 0.16s ease, background-color 0.16s ease',
  selectors: {
    '&:focus': {
      borderColor: 'rgba(255, 86, 34, 0.24)',
      background: '#ffffff',
    },
  },
});

globalStyle(
  `html[data-theme='dark'] ${textarea}, [data-theme='dark'] ${textarea}`,
  {
    color: 'rgba(255, 255, 255, 0.92)',
    background: '#262c31',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }
);

export const composerActions = style({
  gridColumn: '1 / -1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
});

export const footerLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
});

export const footerRight = style({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
});

export const pillButton = style({
  minHeight: 32,
  padding: '0 10px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 999,
  border: '1px solid rgba(67, 75, 81, 0.12)',
  background: '#ffffff',
  color: '#5f676d',
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 600,
  cursor: 'pointer',
  transition:
    'background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease',
  selectors: {
    '&:hover': {
      color: '#f05b2b',
      borderColor: 'rgba(255, 86, 34, 0.22)',
      background: '#fff7f3',
    },
  },
});

globalStyle(
  `html[data-theme='dark'] ${pillButton}, [data-theme='dark'] ${pillButton}`,
  {
    background: '#262c31',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }
);

export const pillButtonActive = style({
  background: 'rgba(255, 86, 34, 0.08)',
  borderColor: 'rgba(255, 86, 34, 0.22)',
  color: '#f05b2b',
});

export const sendButton = style({
  width: 36,
  height: 36,
  border: 'none',
  borderRadius: 18,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  background: 'linear-gradient(180deg, #ff6a31 0%, #f05b2b 100%)',
  boxShadow: '0 4px 10px rgba(255, 86, 34, 0.18)',
  cursor: 'pointer',
  transition: 'filter 0.16s ease, box-shadow 0.16s ease',
  selectors: {
    '&:hover': {
      filter: 'brightness(1.02)',
      boxShadow: '0 6px 12px rgba(255, 86, 34, 0.2)',
    },
    '&:disabled': {
      opacity: 0.48,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
  },
});

export const composerHint = style({
  gridColumn: '1 / -1',
  fontSize: 12,
  lineHeight: 1.4,
  color: '#8b9196',
});

globalStyle(
  `html[data-theme='dark'] ${composerHint}, [data-theme='dark'] ${composerHint}`,
  {
    color: 'rgba(255, 255, 255, 0.58)',
  }
);

export const introSection = style({});
export const actionGrid = style({});
export const actionCard = style({});
export const actionTitle = style({});
export const actionDescription = style({});
export const voiceCard = style({});
export const voiceCardText = style({});
export const voiceCardTitle = style({});
export const voiceCardDescription = style({});
export const voiceBars = style({
  width: 20,
  height: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 3,
  flexShrink: 0,
});

globalStyle(`${voiceBars} span`, {
  width: 2,
  borderRadius: 999,
  background: 'currentColor',
  animation: `${voiceLevel} 0.72s ease-in-out infinite alternate`,
  transformOrigin: 'center bottom',
});

globalStyle(`${voiceBars} span:nth-child(1)`, {
  height: 6,
  animationDelay: '0ms',
});

globalStyle(`${voiceBars} span:nth-child(2)`, {
  height: 14,
  animationDelay: '80ms',
});

globalStyle(`${voiceBars} span:nth-child(3)`, {
  height: 8,
  animationDelay: '160ms',
});

globalStyle(`${voiceBars} span:nth-child(4)`, {
  height: 12,
  animationDelay: '240ms',
});

export const launcher = style({
  pointerEvents: 'auto',
  width: 48,
  height: 48,
  borderRadius: '50%',
  border: 'none',
  background: '#FF6A31',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 16px rgba(255, 106, 49, 0.25)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  padding: 0,
  selectors: {
    '&:hover': {
      background: '#E85A24',
      boxShadow: '0 6px 20px rgba(255, 106, 49, 0.35)',
      transform: 'translateY(-2px)',
    },
  },
});

export const avatarImage = style({
  width: 32,
  height: 32,
  borderRadius: 8,
  objectFit: 'cover',
  flexShrink: 0,
});

export const headerAvatarImage = style({
  width: 32,
  height: 32,
  borderRadius: 8,
  objectFit: 'cover',
  flexShrink: 0,
});

export const launcherHidden = style({
  display: 'none',
});

export const srOnly = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  border: 0,
});
