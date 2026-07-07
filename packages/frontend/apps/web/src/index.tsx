import './setup';

import { Telemetry } from '@bridgeflow/core/components/telemetry';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { AuthGate } from './auth/auth-gate';

// BRIDGE Flow runs the whole app at 1.5x so 100% browser zoom looks like the
// team's preferred 150%. The OKR dashboard route bumps this to 1.75x while it
// is open and restores it to APP_ZOOM on unmount.
export const APP_ZOOM = '1.5';

function mountApp() {
  document.documentElement.style.zoom = APP_ZOOM;
  // oxlint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = document.getElementById('app')!;
  createRoot(root).render(
    <StrictMode>
      <Telemetry />
      <AuthGate>
        <App />
      </AuthGate>
    </StrictMode>
  );
}

try {
  mountApp();
} catch (err) {
  console.error('Failed to bootstrap app', err);
}
