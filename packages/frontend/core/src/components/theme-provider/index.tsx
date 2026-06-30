import { AppThemeService } from '@bridgeflow/core/modules/theme';
import { useService } from '@kanban-studios/infra';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

const themes = ['dark', 'light'];

function ThemeObserver() {
  const { resolvedTheme } = useTheme();
  const service = useService(AppThemeService);

  useEffect(() => {
    service.appTheme.theme$.next(resolvedTheme);
  }, [resolvedTheme, service.appTheme.theme$]);

  return null;
}

const sunIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const moonIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Floating sun/moon button, top-right, to switch light / dark.
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        position: 'fixed',
        top: 60,
        right: 16,
        zIndex: 2147483401,
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '1px solid var(--affine-border-color, rgba(0,0,0,.1))',
        background: 'var(--affine-background-overlay-panel-color, #ffffff)',
        color: 'var(--affine-text-primary-color, #222)',
        boxShadow: '0 4px 14px rgba(0,0,0,.14)',
      }}
    >
      {isDark ? sunIcon : moonIcon}
    </button>
  );
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <NextThemeProvider themes={themes} enableSystem={false} defaultTheme="light">
      {children}
      <ThemeObserver />
      <ThemeToggle />
    </NextThemeProvider>
  );
};
