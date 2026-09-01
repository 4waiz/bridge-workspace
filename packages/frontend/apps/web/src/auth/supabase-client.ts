import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for BRIDGE Flow authentication.
 *
 * SECURITY: only the project URL and the PUBLISHABLE/ANON key live here - these
 * are safe to ship in the browser. The service_role key and JWT secret must NEVER
 * appear in frontend code; they belong only on a trusted server.
 *
 * Values can be overridden at build time via BUILD_CONFIG / env if desired.
 */
const SUPABASE_URL =
  (globalThis as any).BUILD_CONFIG?.supabaseUrl ??
  'https://kcmwwaxajeaojkpjbjjl.supabase.co';

// anon (public) key - safe for the browser.
const SUPABASE_ANON_KEY =
  (globalThis as any).BUILD_CONFIG?.supabaseAnonKey ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbXd3YXhhamVhb2prcGpiampsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mjc0NTUsImV4cCI6MjA5ODMwMzQ1NX0.6sfCNVBY6MJN5FPmYH-tp9xDyiW5YurJBH6oeE8alLg';

/**
 * "Remember me" support. When the user leaves it CHECKED (default) the auth
 * session is stored in localStorage and survives a browser restart. When they
 * UNCHECK it, the session lives in sessionStorage instead, so closing the
 * browser signs them out. The choice is recorded before sign-in and this
 * hybrid storage routes the persisted token to the right place.
 */
const REMEMBER_KEY = 'bridge-flow-remember';

export function setRememberMe(remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
  } catch {
    /* storage unavailable - ignore */
  }
}

function preferSession(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) === 'false';
  } catch {
    return false;
  }
}

const hybridStorage = {
  getItem: (key: string): string | null => {
    try {
      const primary = preferSession()
        ? window.sessionStorage
        : window.localStorage;
      return (
        primary.getItem(key) ??
        window.sessionStorage.getItem(key) ??
        window.localStorage.getItem(key)
      );
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (preferSession()) {
        window.sessionStorage.setItem(key, value);
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
        window.sessionStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  },
  removeItem: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bridge-flow-auth',
    storage: hybridStorage,
  },
});

// Expose the singleton so @bridgeflow/core (which cannot import the web app)
// can reuse the SAME authenticated client for OKR data + realtime.
(globalThis as any).__bridgeSupabase = supabase;

// convenience for manual sign-out from the app / console
(globalThis as any).bridgeSignOut = () => supabase.auth.signOut();
