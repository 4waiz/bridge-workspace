import type { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import type { Workspace } from '@blocksuite/bridgeflow/store';
import { ArrowRightBigIcon } from '@blocksuite/icons/rc';

import type { useNavigateHelper } from '../components/hooks/use-navigate-helper';
import type { WorkspaceDialogService } from '../modules/dialogs';
import type { WorkbenchService } from '../modules/workbench';
import { registerBridgeFlowCommand } from './registry';

export function registerBridgeFlowNavigationCommands({
  t,
  docCollection,
  navigationHelper,
  workspaceDialogService,
  workbenchService,
}: {
  t: ReturnType<typeof useI18n>;
  navigationHelper: ReturnType<typeof useNavigateHelper>;
  docCollection: Workspace;
  workspaceDialogService: WorkspaceDialogService;
  workbenchService?: WorkbenchService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:goto-all-pages',
      category: 'bridgeflow:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.navigation.goto-all-pages'](),
      run() {
        track.$.cmdk.navigation.navigate({
          to: 'allDocs',
        });

        navigationHelper.jumpToPage(docCollection.id, 'all');
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:goto-collection-list',
      category: 'bridgeflow:navigation',
      icon: <ArrowRightBigIcon />,
      label: 'Go to Collection List',
      run() {
        track.$.cmdk.navigation.navigate({
          to: 'collectionList',
        });

        navigationHelper.jumpToCollections(docCollection.id);
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:goto-tag-list',
      category: 'bridgeflow:navigation',
      icon: <ArrowRightBigIcon />,
      label: 'Go to Tag List',
      run() {
        track.$.cmdk.navigation.navigate({
          to: 'tagList',
        });

        navigationHelper.jumpToTags(docCollection.id);
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:goto-workspace',
      category: 'bridgeflow:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.navigation.goto-workspace'](),
      run() {
        track.$.cmdk.navigation.navigate({
          to: 'workspace',
        });

        workbenchService?.workbench.openWorkspaceSelector();
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:open-settings',
      category: 'bridgeflow:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.navigation.open-settings'](),
      keyBinding: '$mod+,',
      run() {
        track.$.cmdk.settings.openSettings();
        workspaceDialogService.open('setting', {
          activeTab: 'appearance',
        });
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:open-account',
      category: 'bridgeflow:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.navigation.open-account-settings'](),
      run() {
        track.$.cmdk.settings.openSettings({ to: 'account' });
        workspaceDialogService.open('setting', {
          activeTab: 'account',
        });
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:goto-trash',
      category: 'bridgeflow:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.navigation.goto-trash'](),
      run() {
        track.$.cmdk.navigation.navigate({
          to: 'trash',
        });

        navigationHelper.jumpToPage(docCollection.id, 'trash');
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
