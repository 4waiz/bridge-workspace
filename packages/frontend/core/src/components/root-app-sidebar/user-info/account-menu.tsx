import { MenuItem } from '@bridgeflow/component';
import { ServerService, UserFeatureService } from '@bridgeflow/core/modules/cloud';
import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { AccountIcon, AdminIcon, SignOutIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect } from 'react';

import { useSignOut } from '../../hooks/bridgeflow/use-sign-out';

export const AccountMenu = () => {
  const workspaceDialogService = useService(WorkspaceDialogService);
  const openSignOutModal = useSignOut();
  const serverService = useService(ServerService);
  const userFeatureService = useService(UserFeatureService);
  const isBridgeFlowAdmin = useLiveData(userFeatureService.userFeature.isAdmin$);

  const onOpenAccountSetting = useCallback(() => {
    track.$.navigationPanel.profileAndBadge.openSettings({ to: 'account' });
    workspaceDialogService.open('setting', {
      activeTab: 'account',
    });
  }, [workspaceDialogService]);

  const onOpenAdminPanel = useCallback(() => {
    window.open(`${serverService.server.baseUrl}/admin`, '_blank');
  }, [serverService.server.baseUrl]);

  const t = useI18n();

  useEffect(() => {
    userFeatureService.userFeature.revalidate();
  }, [userFeatureService]);

  return (
    <>
      <MenuItem
        prefixIcon={<AccountIcon />}
        data-testid="workspace-modal-account-settings-option"
        onClick={onOpenAccountSetting}
      >
        {t['com.bridgeflow.workspace.cloud.account.settings']()}
      </MenuItem>
      {isBridgeFlowAdmin ? (
        <MenuItem
          prefixIcon={<AdminIcon />}
          data-testid="workspace-modal-account-admin-option"
          onClick={onOpenAdminPanel}
        >
          {t['com.bridgeflow.workspace.cloud.account.admin']()}
        </MenuItem>
      ) : null}
      <MenuItem
        prefixIcon={<SignOutIcon />}
        data-testid="workspace-modal-sign-out-option"
        onClick={openSignOutModal}
      >
        {t['com.bridgeflow.workspace.cloud.account.logout']()}
      </MenuItem>
    </>
  );
};
