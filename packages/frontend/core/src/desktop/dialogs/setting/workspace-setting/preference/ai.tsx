import { Switch } from '@bridgeflow/component';
import {
  SettingRow,
  SettingWrapper,
} from '@bridgeflow/component/setting-components';
import { useAsyncCallback } from '@bridgeflow/core/components/hooks/bridgeflow-async-hooks';
import { ServerService } from '@bridgeflow/core/modules/cloud';
import { WorkspacePermissionService } from '@bridgeflow/core/modules/permissions';
import { WorkspaceShareSettingService } from '@bridgeflow/core/modules/share-setting';
import { useI18n } from '@bridgeflow/i18n';
import { useLiveData, useService } from '@kanban-studios/infra';

export const AiSetting = () => {
  const t = useI18n();
  const shareSetting = useService(WorkspaceShareSettingService).sharePreview;
  const serverService = useService(ServerService);
  const serverEnableAi = useLiveData(
    serverService.server.features$.map(f => f?.copilot)
  );
  const workspaceEnableAi = useLiveData(shareSetting.enableAi$);
  const loading = useLiveData(shareSetting.isLoading$);
  const permissionService = useService(WorkspacePermissionService);
  const isOwner = useLiveData(permissionService.permission.isOwner$);

  const toggleAi = useAsyncCallback(
    async (checked: boolean) => {
      await shareSetting.setEnableAi(checked);
    },
    [shareSetting]
  );

  if (!isOwner || !serverEnableAi) {
    return null;
  }

  return (
    <SettingWrapper
      title={t['com.bridgeflow.settings.workspace.bridgeflow-ai.title']()}
    >
      <SettingRow
        name={t['com.bridgeflow.settings.workspace.bridgeflow-ai.label']()}
        desc={t['com.bridgeflow.settings.workspace.bridgeflow-ai.description']()}
      >
        <Switch
          checked={!!workspaceEnableAi}
          onChange={toggleAi}
          disabled={loading}
        />
      </SettingRow>
    </SettingWrapper>
  );
};
