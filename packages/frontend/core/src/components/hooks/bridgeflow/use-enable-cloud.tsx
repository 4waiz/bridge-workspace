import { notify, useConfirmModal } from '@bridgeflow/component';
import { AuthService, ServersService } from '@bridgeflow/core/modules/cloud';
import { GlobalDialogService } from '@bridgeflow/core/modules/dialogs';
import type { Workspace } from '@bridgeflow/core/modules/workspace';
import { WorkspacesService } from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback } from 'react';

import { useNavigateHelper } from '../use-navigate-helper';

interface ConfirmEnableCloudOptions {
  /**
   * Fired when the workspace is successfully enabled
   */
  onSuccess?: () => void;
  /**
   * Fired when workspace is successfully enabled or user cancels the operation
   */
  onFinished?: () => void;
  openPageId?: string;
  serverId?: string;
}
type ConfirmEnableArgs = [Workspace, ConfirmEnableCloudOptions | undefined];

export const useEnableCloud = () => {
  const t = useI18n();
  const authService = useService(AuthService);
  const account = useLiveData(authService.session.account$);
  const loginStatus = useLiveData(useService(AuthService).session.status$);
  const globalDialogService = useService(GlobalDialogService);
  const { openConfirmModal, closeConfirmModal } = useConfirmModal();
  const workspacesService = useService(WorkspacesService);
  const serversService = useService(ServersService);
  const serverList = useLiveData(serversService.servers$);

  const { jumpToPage } = useNavigateHelper();

  const localOnlyMode = BUILD_CONFIG.isWeb && !environment.isSelfHosted;

  const enableCloud = useCallback(
    async (ws: Workspace | null, options?: ConfirmEnableCloudOptions) => {
      try {
        if (!ws) return;
        if (!account) return;
        const { id: newId } = await workspacesService.transformLocalToCloud(
          ws,
          account.id,
          'bridgeflow-cloud'
        );
        jumpToPage(newId, options?.openPageId || 'all');
        options?.onSuccess?.();
      } catch (e) {
        console.error(e);
        notify.error({
          title: t['com.bridgeflow.workspace.enable-cloud.failed'](),
        });
      }
    },
    [account, jumpToPage, t, workspacesService]
  );

  const openSignIn = useCallback(
    () =>
      globalDialogService.open('sign-in', {
        step: 'signIn',
      }),
    [globalDialogService]
  );

  const signInOrEnableCloud = useCallback(
    async (...args: ConfirmEnableArgs) => {
      // not logged in, open login modal
      if (loginStatus === 'unauthenticated') {
        openSignIn();
      }

      if (loginStatus === 'authenticated') {
        await enableCloud(...args);
      }
    },
    [enableCloud, loginStatus, openSignIn]
  );

  const confirmEnableCloud = useCallback(
    (ws: Workspace, options?: ConfirmEnableCloudOptions) => {
      if (localOnlyMode) {
        notify.warning({
          title: 'BRIDGE Flow is running in local-only mode.',
          message:
            'Cloud sync and sign-in are disabled until a server is configured.',
        });
        options?.onFinished?.();
        return;
      }

      const { onSuccess, onFinished, serverId, openPageId } = options ?? {};

      const closeOnSuccess = () => {
        closeConfirmModal();
        onSuccess?.();
      };

      if (serverList.length > 1) {
        globalDialogService.open('enable-cloud', {
          workspaceId: ws.id,
          serverId,
          openPageId,
        });
        return;
      }

      openConfirmModal(
        {
          title: t['Enable BridgeFlow Cloud'](),
          description: t['Enable BridgeFlow Cloud Description'](),
          cancelText: t['com.bridgeflow.enableBridgeFlowCloudModal.button.cancel'](),
          confirmText:
            loginStatus === 'authenticated'
              ? t['Enable']()
              : t['Sign in and Enable'](),
          confirmButtonOptions: {
            variant: 'primary',
            ['data-testid' as string]: 'confirm-enable-bridgeflow-cloud-button',
          },
          onConfirm: async () =>
            await signInOrEnableCloud(ws, {
              ...options,
              onSuccess: closeOnSuccess,
            }),
          onOpenChange: open => {
            if (!open) onFinished?.();
          },
        },
        {
          autoClose: false,
        }
      );
    },
    [
      closeConfirmModal,
      globalDialogService,
      localOnlyMode,
      loginStatus,
      openConfirmModal,
      serverList.length,
      signInOrEnableCloud,
      t,
    ]
  );

  return confirmEnableCloud;
};
