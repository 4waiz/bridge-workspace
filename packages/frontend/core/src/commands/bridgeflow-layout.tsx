import type { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { SidebarIcon } from '@blocksuite/icons/rc';

import type { AppSidebarService } from '../modules/app-sidebar';
import { registerBridgeFlowCommand } from './registry';

export function registerBridgeFlowLayoutCommands({
  t,
  appSidebarService,
}: {
  t: ReturnType<typeof useI18n>;
  appSidebarService: AppSidebarService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:toggle-left-sidebar',
      category: 'bridgeflow:layout',
      icon: <SidebarIcon />,
      label: () =>
        appSidebarService.sidebar.open$.value
          ? t['com.bridgeflow.cmdk.bridgeflow.left-sidebar.collapse']()
          : t['com.bridgeflow.cmdk.bridgeflow.left-sidebar.expand'](),

      keyBinding: {
        binding: '$mod+/',
      },
      run() {
        track.$.navigationPanel.$.toggle({
          type: appSidebarService.sidebar.open$.value ? 'collapse' : 'expand',
        });
        appSidebarService.sidebar.toggleSidebar();
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
