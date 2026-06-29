import { SettingRow } from '@bridgeflow/component/setting-components';
import { Button } from '@bridgeflow/component/ui/button';
import { useEnableCloud } from '@bridgeflow/core/components/hooks/bridgeflow/use-enable-cloud';
import {
  type Workspace,
  WorkspaceService,
} from '@bridgeflow/core/modules/workspace';
import { UNTITLED_WORKSPACE_NAME } from '@bridgeflow/env/constant';
import { useI18n } from '@bridgeflow/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback } from 'react';

export interface PublishPanelProps {
  workspace: Workspace | null;
}

export const EnableCloudPanel = ({
  onCloseSetting,
}: {
  onCloseSetting?: () => void;
}) => {
  const t = useI18n();
  const confirmEnableCloud = useEnableCloud();

  const workspace = useService(WorkspaceService).workspace;
  const name = useLiveData(workspace.name$);
  const flavour = workspace.flavour;

  const confirmEnableCloudAndClose = useCallback(() => {
    if (!workspace) return;
    confirmEnableCloud(workspace, {
      onSuccess: () => {
        onCloseSetting?.();
      },
    });
  }, [confirmEnableCloud, onCloseSetting, workspace]);

  if (flavour !== 'local') {
    return null;
  }

  return (
    <SettingRow
      name={t['Workspace saved locally']({
        name: name ?? UNTITLED_WORKSPACE_NAME,
      })}
      desc={t['Enable cloud hint']()}
      spreadCol={false}
      style={{
        padding: '10px',
        background: 'var(--bridgeflow-background-secondary-color)',
        marginTop: '24px',
      }}
    >
      <Button
        data-testid="publish-enable-bridgeflow-cloud-button"
        variant="primary"
        onClick={confirmEnableCloudAndClose}
        style={{ marginTop: '12px' }}
      >
        {t['Enable BridgeFlow Cloud']()}
      </Button>
    </SettingRow>
  );
};
