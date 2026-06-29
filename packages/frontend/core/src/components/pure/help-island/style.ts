import { displayFlex, positionAbsolute, styled } from '@bridgeflow/component';

export const StyledIsland = styled('div')<{
  spread: boolean;
  inEdgelessPage?: boolean;
}>(({ spread, inEdgelessPage }) => {
  return {
    width: '44px',
    position: 'relative',
    boxShadow: spread
      ? 'var(--bridgeflow-menu-shadow)'
      : inEdgelessPage
        ? 'var(--bridgeflow-menu-shadow)'
        : 'unset',
    padding: '0 4px 44px',
    borderRadius: '10px',
    background: spread
      ? 'var(--bridgeflow-background-overlay-panel-color)'
      : 'var(--bridgeflow-background-primary-color)',
    ':hover': {
      background: spread ? undefined : 'var(--bridgeflow-white)',
      boxShadow: spread ? undefined : 'var(--bridgeflow-menu-shadow)',
    },
    '::after': {
      content: '""',
      width: '36px',
      height: '1px',
      background: spread ? 'var(--bridgeflow-border-color)' : 'transparent',
      ...positionAbsolute({
        left: 0,
        right: 0,
        bottom: '44px',
      }),
      margin: 'auto',
      transition: 'background 0.15s',
    },
  };
});
export const StyledIconWrapper = styled('div')({
  color: 'var(--bridgeflow-icon-color)',
  ...displayFlex('center', 'center'),
  cursor: 'pointer',
  fontSize: '24px',
  borderRadius: '5px',
  width: '36px',
  height: '36px',
  margin: '4px auto 4px',
  transition: 'background-color 0.2s',
  position: 'relative',
  ':hover': {
    backgroundColor: 'var(--bridgeflow-hover-color)',
  },
});

export const StyledAnimateWrapper = styled('div')(() => ({
  transition: 'height 0.2s cubic-bezier(0, 0, 0.55, 1.6)',
  overflow: 'hidden',
}));

export const StyledTriggerWrapper = styled('div')<{
  spread?: boolean;
}>(({ spread }) => {
  return {
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    color: 'var(--bridgeflow-icon-color)',
    borderRadius: '5px',
    fontSize: '24px',
    ...displayFlex('center', 'center'),
    ...positionAbsolute({ left: '4px', bottom: '4px' }),
    ':hover': {
      backgroundColor: spread ? 'var(--bridgeflow-hover-color)' : undefined,
    },
  };
});
