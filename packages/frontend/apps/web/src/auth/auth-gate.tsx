import type { Session } from '@supabase/supabase-js';
import { type ReactNode, useEffect, useState } from 'react';

import { BridgeAuthPage } from './bridge-auth';
import { BRIDGE_ICON } from './logos';
import { supabase } from './supabase-client';

/**
 * Gates the whole app behind Supabase auth. On load:
 *  - while the session is resolving → branded splash
 *  - no session → BRIDGE sign-in / sign-up page
 *  - signed in → renders the app
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!ready) return <AuthSplash />;
  if (!session) return <BridgeAuthPage />;
  return <>{children}</>;
}

function AuthSplash() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: '#f6f7f9',
        fontFamily: '"Segoe UI","Helvetica Neue",Arial,sans-serif',
      }}
    >
      <style>{`@keyframes bfsplash{to{transform:rotate(360deg)}}`}</style>
      <img src={BRIDGE_ICON} alt="BRIDGE Flow" width={56} height={56} style={{ objectFit: 'contain' }} />
      <div
        style={{
          width: 26,
          height: 26,
          border: '3px solid #e7e9ec',
          borderTopColor: '#f15a29',
          borderRadius: '50%',
          animation: 'bfsplash .7s linear infinite',
        }}
      />
    </div>
  );
}
