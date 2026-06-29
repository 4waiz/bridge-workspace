import { useEffect, useState } from 'react';

/**
 * Permanent personalised greeting shown while signed in.
 *
 * Reads the identity AuthGate publishes on `globalThis.__bridgeFlowUser` and
 * renders a compact "Good {morning/afternoon/evening}, {name}" card pinned to
 * the bottom-right. It styles itself with the app's `--affine-*` theme
 * variables so it automatically matches dark / light mode, and renders the
 * name in the BRIDGE script font (same as the intro page).
 */

const USER_EVENT = 'bridge-user-changed';

type BridgeUser = { id: string; email?: string; name?: string } | null;

function currentUser(): BridgeUser {
  return (globalThis as any).__bridgeFlowUser ?? null;
}

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// "MONDAY, 29 JUN 2026"
function longDate(d: Date) {
  const day = d
    .toLocaleDateString(undefined, { weekday: 'long' })
    .toUpperCase();
  const month = d
    .toLocaleDateString(undefined, { month: 'short' })
    .toUpperCase();
  return `${day}, ${d.getDate()} ${month} ${d.getFullYear()}`;
}

// First name / handle from the identity, with a friendly fallback.
function firstName(user: BridgeUser) {
  const raw = (user?.name || user?.email || '').trim();
  if (!raw) return 'there';
  const handle = raw.includes('@') ? raw.split('@')[0] : raw;
  const first = handle.split(/[\s._-]+/).find(Boolean) || handle;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function BridgeWelcome() {
  const [user, setUser] = useState<BridgeUser>(() => currentUser());

  useEffect(() => {
    const evaluate = () => setUser(currentUser());
    evaluate();
    window.addEventListener(USER_EVENT, evaluate);
    return () => window.removeEventListener(USER_EVENT, evaluate);
  }, []);

  if (!user) return null;

  const now = new Date();

  return (
    <div className="bfw-wrap" role="status" aria-live="polite">
      <style>{STYLES}</style>
      <div className="bfw-card">
        <div className="bfw-date">{longDate(now)}</div>
        <h2 className="bfw-greeting">
          {greeting(now.getHours())},{' '}
          <span className="bfw-name">{firstName(user)}</span>
        </h2>
        <p className="bfw-sub">Here’s your operating snapshot for today.</p>
      </div>
    </div>
  );
}

const STYLES = `
@font-face{font-family:'BridgeScript';src:url('/fonts/Kalam-Bold.woff2') format('woff2');font-display:swap;font-weight:700}
.bfw-wrap{position:fixed;right:18px;bottom:18px;z-index:2147483400;
  font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;pointer-events:none;
  animation:bfw-in .4s cubic-bezier(.2,.8,.2,1)}
@keyframes bfw-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.bfw-card{pointer-events:auto;min-width:268px;max-width:330px;padding:15px 19px 17px;border-radius:16px;
  background:var(--affine-background-overlay-panel-color,#f4efe7);
  border:1px solid var(--affine-border-color,#e7dfd2);
  color:var(--affine-text-primary-color,#1f2430);
  box-shadow:0 18px 44px -22px rgba(0,0,0,.5)}
.bfw-date{font-size:11px;font-weight:700;letter-spacing:1.4px;color:var(--affine-text-secondary-color,#8a9099)}
.bfw-greeting{margin:6px 0 0;font-size:21px;line-height:1.2;font-weight:800;letter-spacing:-.3px}
.bfw-name{font-family:'BridgeScript','Segoe Print',cursive;font-weight:700;font-size:1.32em;
  color:var(--affine-brand-color,#f15a29)}
.bfw-sub{margin:7px 0 0;font-size:13px;color:var(--affine-text-secondary-color,#7c7567)}
@media (max-width:560px){
  .bfw-wrap{right:12px;bottom:12px}
  .bfw-card{min-width:0;max-width:calc(100vw - 24px)}
}
`;
