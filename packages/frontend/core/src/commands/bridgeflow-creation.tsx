import type { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import type { DocMode } from '@blocksuite/bridgeflow/model';
import { ImportIcon, PlusIcon } from '@blocksuite/icons/rc';

import type { usePageHelper } from '../blocksuite/block-suite-page-list/utils';
import type { GlobalDialogService } from '../modules/dialogs';
import { registerBridgeFlowCommand } from './registry';

export function registerBridgeFlowCreationCommands({
  pageHelper,
  t,
  globalDialogService,
}: {
  t: ReturnType<typeof useI18n>;
  pageHelper: ReturnType<typeof usePageHelper>;
  globalDialogService: GlobalDialogService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:new-page',
      category: 'bridgeflow:creation',
      label: t['com.bridgeflow.cmdk.bridgeflow.new-page'](),
      icon: <PlusIcon />,
      keyBinding: BUILD_CONFIG.isElectron
        ? {
            binding: '$mod+N',
            skipRegister: true,
          }
        : undefined,
      run() {
        track.$.cmdk.creation.createDoc({ mode: 'page' });

        pageHelper.createPage('page' as DocMode);
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:new-edgeless-page',
      category: 'bridgeflow:creation',
      icon: <PlusIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.new-edgeless-page'](),
      run() {
        track.$.cmdk.creation.createDoc({
          mode: 'edgeless',
        });

        pageHelper.createEdgeless();
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:new-workspace',
      category: 'bridgeflow:creation',
      icon: <PlusIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.new-workspace'](),
      run() {
        track.$.cmdk.workspace.createWorkspace();

        globalDialogService.open('create-workspace', {});
      },
    })
  );
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:import-workspace',
      category: 'bridgeflow:creation',
      icon: <ImportIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.import-workspace'](),
      preconditionStrategy: () => {
        return BUILD_CONFIG.isElectron;
      },
      run() {
        track.$.cmdk.workspace.createWorkspace({
          control: 'import',
        });

        globalDialogService.open('import-workspace', undefined);
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
