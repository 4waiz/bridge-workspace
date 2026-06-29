import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for BRIDGE Flow authentication.
 *
 * SECURITY: only the project URL and the PUBLISHABLE/ANON key live here — these
 * are safe to ship in the browser. The service_role key and JWT secret must NEVER
 * appear in frontend code; they belong only on a trusted server.
 *
 * Values can be overridden at build time via BUILD_CONFIG / env if desired.
 */
const SUPABASE_URL =
  (globalThis as any).BUILD_CONFIG?.supabaseUrl ??
  'https://kcmwwaxajeaojkpjbjjl.supabase.co';

// anon (public) key — safe for the browser.
const SUPABASE_ANON_KEY =
  (globalThis as any).BUILD_CONFIG?.supabaseAnonKey ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbXd3YXhhamVhb2prcGpiampsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mjc0NTUsImV4cCI6MjA5ODMwMzQ1NX0.6sfCNVBY6MJN5FPmYH-tp9xDyiW5YurJBH6oeE8alLg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bridge-flow-auth',
  },
});

// convenience for manual sign-out from the app / console
(globalThis as any).bridgeSignOut = () => supabase.auth.signOut();
