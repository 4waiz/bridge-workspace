import { type RefObject, useEffect, useLayoutEffect } from 'react';

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

/**
 * The dashboard never shrinks past this, even if the content still overflows.
 * Below roughly this scale the wall board stops being readable from across the
 * room, at which point a scrollbar is the lesser evil.
 */
export const OKR_DASHBOARD_MIN_ZOOM = 0.34;
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

/**
 * usePageZoom, but it shrinks below `zoom` until `ref`'s content fits the
 * viewport height.
 *
 * The OKR dashboard hangs on a wall-mounted TV that nobody scrolls, so anything
 * past the fold is simply never seen. How much content there is varies - teams
 * add objectives, titles wrap onto more lines - so a single hand-picked scale
 * cannot hold. This measures what is actually rendered and scales to fit.
 *
 * Never grows past `zoom`, never shrinks past `min`; if it bottoms out the root
 * element's own overflow still allows scrolling as a last resort.
 *
 * `signal` re-runs the fit when the content changes - pass whatever value
 * identifies the current data.
 */
export function useFitPageZoom(
  zoom: string,
  ref: RefObject<HTMLElement | null>,
  signal?: unknown,
  min = OKR_DASHBOARD_MIN_ZOOM
) {
  useLayoutEffect(() => {
    const el = document.documentElement;
    const prev = el.style.zoom;

    const fit = () => {
      const base = Number(zoom) || 1;
      let z = base;
      el.style.zoom = String(z);

      const node = ref.current;
      if (!node) return;

      // Re-measure each pass: shrinking hands the board more CSS pixels, which
      // re-wraps text and changes the height again. Converges within two or
      // three, and the cap stops any chance of a runaway loop.
      for (let i = 0; i < 4; i++) {
        const need = node.scrollHeight;
        const have = node.clientHeight;
        // 1px of slack - sub-pixel rounding alone should not trigger a shrink.
        if (need <= have + 1 || z <= min) break;
        // 0.995 keeps a hair of margin so the fitted board does not sit flush
        // against the bottom edge and re-trigger a scrollbar.
        z = Math.max(min, z * (have / need) * 0.995);
        el.style.zoom = String(z);
      }
    };

    fit();
    // Web fonts and late images land after first paint and change the height.
    const raf = requestAnimationFrame(fit);
    window.addEventListener('resize', fit);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
      el.style.zoom = prev || APP_ZOOM;
    };
  }, [zoom, ref, min, signal]);
}
