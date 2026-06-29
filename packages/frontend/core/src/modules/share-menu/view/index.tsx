import { useEnableCloud } from '@bridgeflow/core/components/hooks/bridgeflow/use-enable-cloud';
import { WorkspaceShareSettingService } from '@bridgeflow/core/modules/share-setting';
import type { Workspace } from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import type { Store } from '@blocksuite/bridgeflow/store';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect } from 'react';

import { ShareMenu } from './share-menu';
export { CloudSvg } from './cloud-svg';
export { ShareMenuContent } from './share-menu';

type SharePageModalProps = {
  workspace: Workspace;
  page: Store;
};

export const SharePageButton = ({ workspace, page }: SharePageModalProps) => {
  const t = useI18n();
  const shareSetting = useService(WorkspaceShareSettingService).sharePreview;
  const enableSharing = useLiveData(shareSetting.enableSharing$);

  const confirmEnableCloud = useEnableCloud();
  const handleOpenShareModal = useCallback((open: boolean) => {
    if (open) {
      track.$.sharePanel.$.open();
    }
  }, []);

  useEffect(() => {
    if (workspace.meta.flavour === 'local') {
      return;
    }
    shareSetting.revalidate();
  }, [shareSetting, workspace.meta.flavour]);

  const sharingDisabled = enableSharing === false;
  const disabledReason = sharingDisabled
    ? t['com.bridgeflow.share-menu.workspace-sharing.disabled.tooltip']()
    : undefined;

  return (
    <ShareMenu
      workspaceMetadata={workspace.meta}
      currentPage={page}
      onEnableBridgeFlowCloud={() =>
        confirmEnableCloud(workspace, {
          openPageId: page.id,
        })
      }
      onOpenShareModal={handleOpenShareModal}
      disabled={sharingDisabled}
      disabledReason={disabledReason}
    />
  );
};
