import { type CSSProperties, useEffect, useState } from 'react';

import {
  fetchOverlayUrl,
  OVERLAY_PERIOD_MS,
  subscribeOverlay,
} from './business-ops';

/**
 * The Business Ops slide the wall board alternates with: one period of OKRs,
 * one period of this, forever. Mounted by the dashboard and otherwise inert.
 *
 * `onShownChange` reports when the slide actually covers the board, so the
 * board can stop animating what nobody can see.
 */
export function BusinessOpsOverlay({
  onShownChange,
}: {
  onShownChange?: (shown: boolean) => void;
} = {}) {
  const [url, setUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // The timer flips `visible` even before an image exists; only an image on
  // screen hides the board.
  const shown = visible && !!url;
  useEffect(() => {
    onShownChange?.(shown);
  }, [shown, onShownChange]);

  // Current image, re-read whenever someone uploads a replacement. The screen
  // is unattended, so this is the only way a new picture ever reaches it.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchOverlayUrl()
        .then(next => {
          if (!cancelled) setUrl(next);
        })
        .catch(() => {
          /* keep whatever is already showing */
        });
    };
    load();
    const unsub = subscribeOverlay(load);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  // Starts hidden, so the board is what you see when the screen first wakes.
  useEffect(() => {
    const timer = setInterval(
      () => setVisible(current => !current),
      OVERLAY_PERIOD_MS
    );
    return () => clearInterval(timer);
  }, []);

  // Warm the cache before the first reveal - the element below is always in the
  // DOM, but a freshly-uploaded URL would otherwise pop in mid-fade.
  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  }, [url]);

  if (!url) return null;

  return (
    <div
      style={{
        ...S.wrap,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      aria-hidden={!visible}
    >
      <img src={url} alt="Business Ops Dashboard" style={S.img} />
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  wrap: {
    position: 'fixed',
    inset: 0,
    // Above the dashboard (9999) and its close button (10000).
    zIndex: 10050,
    display: 'grid',
    placeItems: 'center',
    background: '#0b0d10',
    transition: 'opacity 600ms ease',
  },
  img: {
    width: '100%',
    height: '100%',
    // `contain`, not `cover`: this is a dashboard screenshot, so cropping the
    // edges to fill would cut off the very numbers it is there to show.
    objectFit: 'contain',
    display: 'block',
  },
};
