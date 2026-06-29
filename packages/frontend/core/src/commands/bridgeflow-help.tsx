import type { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { ContactWithUsIcon, NewIcon } from '@blocksuite/icons/rc';

import type { WorkspaceDialogService } from '../modules/dialogs';
import type { UrlService } from '../modules/url';
import { registerBridgeFlowCommand } from './registry';

export function registerBridgeFlowHelpCommands({
  t,
  urlService,
  workspaceDialogService,
}: {
  t: ReturnType<typeof useI18n>;
  urlService: UrlService;
  workspaceDialogService: WorkspaceDialogService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:help-whats-new',
      category: 'bridgeflow:help',
      icon: <NewIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.whats-new'](),
      run() {
        track.$.cmdk.help.openChangelog();
        urlService.openPopupWindow(BUILD_CONFIG.changelogUrl);
      },
    })
  );
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:help-contact-us',
      category: 'bridgeflow:help',
      icon: <ContactWithUsIcon />,
      label: t['com.bridgeflow.cmdk.bridgeflow.contact-us'](),
      run() {
        track.$.cmdk.help.contactUs();
        workspaceDialogService.open('setting', {
          activeTab: 'about',
        });
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
