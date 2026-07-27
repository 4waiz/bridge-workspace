import './setup';

import { Telemetry } from '@bridgeflow/core/components/telemetry';
import { APP_ZOOM } from '@bridgeflow/core/utils/app-zoom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { AuthGate } from './auth/auth-gate';

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
