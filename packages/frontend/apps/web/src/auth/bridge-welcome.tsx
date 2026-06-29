import { useEffect, useState } from 'react';

/**
 * Personalised greeting shown once after the user signs in.
 *
 * Reads the identity published by AuthGate on `globalThis.__bridgeFlowUser`
 * (see auth-gate.tsx) so it stays decoupled from the supabase client, and
 * renders a "Good {morning/afternoon/evening}, {name}" banner with today's
 * date and an operating-snapshot subtitle.
 *
 * It surfaces once per browser session (tracked in sessionStorage) so it
 * doesn't nag on every reload, and is dismissible.
 */

const SEEN_KEY = 'bridge-flow-welcomed';
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
  const first = handle.split(/[\s._-]+/).filter(Boolean)[0] || handle;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function BridgeWelcome() {
  const [user, setUser] = useState<BridgeUser>(() => currentUser());
  const [show, setShow] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const u = currentUser();
      setUser(u);
      if (!u) {
        // signed out → reset so the next sign-in greets again
        try {
          sessionStorage.removeItem(SEEN_KEY);
        } catch {
          /* ignore */
        }
        setShow(false);
        return;
      }
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === u.id;
      } catch {
        /* ignore */
      }
      if (!seen) setShow(true);
    };

    evaluate();
    window.addEventListener(USER_EVENT, evaluate);
    return () => window.removeEventListener(USER_EVENT, evaluate);
  }, []);

  // auto-dismiss after a few seconds
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => dismiss(), 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const dismiss = () => {
    setShow(false);
    const u = currentUser();
    if (u) {
      try {
        sessionStorage.setItem(SEEN_KEY, u.id);
      } catch {
        /* ignore */
      }
    }
  };

  if (!show || !user) return null;

  const now = new Date();

  return (
    <div className="bfw-wrap" role="status" aria-live="polite">
      <style>{STYLES}</style>
      <div className="bfw-card">
        <button className="bfw-close" onClick={dismiss} aria-label="Dismiss">
          ×
        </button>
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
.bfw-wrap{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:2147483640;
  font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;pointer-events:none;
  animation:bfw-in .35s cubic-bezier(.2,.8,.2,1)}
@keyframes bfw-in{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
.bfw-card{position:relative;pointer-events:auto;min-width:340px;max-width:min(560px,calc(100vw - 32px));
  padding:20px 26px 22px;background:#f4efe7;border:1px solid #e7dfd2;border-radius:16px;
  box-shadow:0 24px 60px -28px rgba(45,52,63,.55)}
.bfw-close{position:absolute;top:10px;right:12px;border:0;background:transparent;font-size:22px;line-height:1;
  color:#b5ab9a;cursor:pointer;padding:2px 6px}
.bfw-close:hover{color:#6b6557}
.bfw-date{font-size:12.5px;font-weight:700;letter-spacing:1.6px;color:#6c5ce7}
.bfw-greeting{margin:8px 0 0;font-size:34px;line-height:1.1;font-weight:800;letter-spacing:-.5px;color:#1f2430}
.bfw-name{color:#6c5ce7}
.bfw-sub{margin:8px 0 0;font-size:15px;color:#7c7567}
@media (max-width:560px){
  .bfw-greeting{font-size:27px}
  .bfw-card{min-width:0}
}
`;
