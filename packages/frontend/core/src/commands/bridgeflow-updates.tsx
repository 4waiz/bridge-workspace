import { notify } from '@bridgeflow/component';
import { updateReadyAtom } from '@bridgeflow/core/components/hooks/use-app-updater';
import type { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { ResetIcon } from '@blocksuite/icons/rc';
import type { createStore } from 'jotai';

import { registerBridgeFlowCommand } from './registry';

export function registerBridgeFlowUpdatesCommands({
  t,
  store,
  quitAndInstall,
}: {
  t: ReturnType<typeof useI18n>;
  store: ReturnType<typeof createStore>;
  quitAndInstall: () => Promise<void>;
}) {
  const unsubs: Array<() => void> = [];

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:restart-to-upgrade',
      category: 'bridgeflow:updates',
      icon: <ResetIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.restart-to-upgrade'](),
      preconditionStrategy: () => !!store.get(updateReadyAtom),
      run() {
        track.$.cmdk.updates.quitAndInstall();

        quitAndInstall().catch(err => {
          notify.error({
            title: 'Failed to restart to upgrade',
            message: 'Please restart the app manually to upgrade.',
          });
          console.error(err);
        });
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
