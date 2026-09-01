import { useEffect } from 'react';

// BRIDGE Flow renders under a CSS zoom on <html> so that 100% browser zoom
// lands on the scale the team actually works at, instead of asking everyone to
// set a per-site zoom by hand.
//
// The app shell is authored to read well at 0.67x of the old 1.5x baseline, so
// 100% browser zoom now shows what used to require zooming out to 67%.
export const APP_ZOOM = '1';

// The OKR views are much denser than the rest of the app - each is laid out to
// fill one viewport - so they carry their own scale and restore APP_ZOOM when
// they unmount. The editor and objective views sit 1.1x above their old
// baselines, which is what 110% browser zoom used to give. The dashboard has
// come down two 10% steps from there (0.866 → 0.779 → 0.701): it is the only
// view shown on a wall-mounted screen, where the whole board has to read at a
// glance without scrolling.
export const OKR_DASHBOARD_ZOOM = '0.701';
export const OKR_EDITOR_ZOOM = '1.32';
export const OKR_OBJECTIVE_ZOOM = '0.66';

/**
 * Scale <html> to `zoom` for as long as the calling component is mounted, then
 * put back whatever was there before (APP_ZOOM, unless another view had already
 * overridden it).
 */
export function usePageZoom(zoom: string) {
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.zoom;
    el.style.zoom = zoom;
    return () => {
      el.style.zoom = prev || APP_ZOOM;
    };
  }, [zoom]);
}
