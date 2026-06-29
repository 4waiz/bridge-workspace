import { BridgeFlowContext } from '@bridgeflow/core/components/context';
import { AppContainer } from '@bridgeflow/core/desktop/components/app-container';
import { router } from '@bridgeflow/core/desktop/router';
import { configureCommonModules } from '@bridgeflow/core/modules';
import { I18nProvider } from '@bridgeflow/core/modules/i18n';
import { LifecycleService } from '@bridgeflow/core/modules/lifecycle';
import {
  configureLocalStorageStateStorageImpls,
  NbstoreProvider,
} from '@bridgeflow/core/modules/storage';
import { PopupWindowProvider } from '@bridgeflow/core/modules/url';
import { configureBrowserWorkbenchModule } from '@bridgeflow/core/modules/workbench';
import { configureBrowserWorkspaceFlavours } from '@bridgeflow/core/modules/workspace-engine';
import createEmotionCache from '@bridgeflow/core/utils/create-emotion-cache';
import { getWorkerUrl } from '@bridgeflow/env/worker';
import { StoreManagerClient } from '@bridgeflow/nbstore/worker/client';
import { setTelemetryTransport } from '@bridgeflow/track';
import { CacheProvider } from '@emotion/react';
import { Framework, FrameworkRoot, getCurrentStore } from '@kanban-studios/infra';
import { OpClient } from '@kanban-studios/infra/op';
import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

const cache = createEmotionCache();

let storeManagerClient: StoreManagerClient;

const workerUrl = getWorkerUrl('nbstore');

if (
  window.SharedWorker &&
  localStorage.getItem('disableSharedWorker') !== 'true'
) {
  const worker = new SharedWorker(workerUrl, {
    name: 'bridgeflow-shared-worker',
  });
  storeManagerClient = new StoreManagerClient(new OpClient(worker.port));
} else {
  const worker = new Worker(workerUrl);
  storeManagerClient = new StoreManagerClient(new OpClient(worker));
}
setTelemetryTransport(storeManagerClient.telemetry);
window.addEventListener('beforeunload', () => {
  storeManagerClient.dispose();
});
window.addEventListener('focus', () => {
  storeManagerClient.resume();
});
window.addEventListener('click', () => {
  storeManagerClient.resume();
});
window.addEventListener('blur', () => {
  storeManagerClient.pause();
});

const future = {
  v7_startTransition: true,
} as const;

const framework = new Framework();
configureCommonModules(framework);
configureBrowserWorkbenchModule(framework);
configureLocalStorageStateStorageImpls(framework);
configureBrowserWorkspaceFlavours(framework);
framework.impl(NbstoreProvider, {
  openStore(key, options) {
    return storeManagerClient.open(key, options);
  },
});
framework.impl(PopupWindowProvider, {
  open: (target: string) => {
    const targetUrl = new URL(target);

    let url: string;
    // safe to open directly if in the same origin
    if (targetUrl.origin === location.origin) {
      url = target;
    } else {
      const redirectProxy = location.origin + '/redirect-proxy';
      const search = new URLSearchParams({
        redirect_uri: target,
      });

      url = `${redirectProxy}?${search.toString()}`;
    }
    window.open(url, '_blank', 'popup noreferrer noopener');
  },
});
const frameworkProvider = framework.provider();

type BridgeWelcomeWindow = Window & {
  __bridgeWelcomeMarkReady?: () => void;
};

// setup application lifecycle events, and emit application start event
window.addEventListener('focus', () => {
  frameworkProvider.get(LifecycleService).applicationFocus();
});
frameworkProvider.get(LifecycleService).applicationStart();

export function App() {
  useEffect(() => {
    (window as BridgeWelcomeWindow).__bridgeWelcomeMarkReady?.();
  }, []);

  return (
    <Suspense>
      <FrameworkRoot framework={frameworkProvider}>
        <CacheProvider value={cache}>
          <I18nProvider>
            <BridgeFlowContext store={getCurrentStore()}>
              <RouterProvider
                fallbackElement={<AppContainer fallback />}
                router={router}
                future={future}
              />
            </BridgeFlowContext>
          </I18nProvider>
        </CacheProvider>
      </FrameworkRoot>
    </Suspense>
  );
}
