import { Button, Tooltip } from '@bridgeflow/component';
import { SettingRow } from '@bridgeflow/component/setting-components';
import { BridgeFlowErrorBoundary } from '@bridgeflow/core/components/bridgeflow/bridgeflow-error-boundary';
import { useWorkspaceInfo } from '@bridgeflow/core/components/hooks/use-workspace-info';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import { useService } from '@kanban-studios/infra';
import type { ReactElement } from 'react';

import type { SettingState } from '../../types';
import { EnableCloudPanel } from '../preference/enable-cloud';
import { CloudWorkspaceMembersPanel } from './cloud-members-panel';
import * as styles from './styles.css';

export const MembersPanel = ({
  onChangeSettingState,
  onCloseSetting,
}: {
  onChangeSettingState: (settingState: SettingState) => void;
  onCloseSetting: () => void;
}): ReactElement | null => {
  const workspace = useService(WorkspaceService).workspace;
  const isTeam = useWorkspaceInfo(workspace.meta)?.isTeam;
  if (workspace.flavour === 'local') {
    return <MembersPanelLocal onCloseSetting={onCloseSetting} />;
  }
  return (
    <BridgeFlowErrorBoundary>
      <CloudWorkspaceMembersPanel
        onChangeSettingState={onChangeSettingState}
        isTeam={isTeam}
      />
    </BridgeFlowErrorBoundary>
  );
};

const MembersPanelLocal = ({
  onCloseSetting,
}: {
  onCloseSetting: () => void;
}) => {
  const t = useI18n();
  return (
    <div className={styles.localMembersPanel}>
      <Tooltip content={t['com.bridgeflow.settings.member-tooltip']()}>
        <div className={styles.fakeWrapper}>
          <SettingRow name={`${t['Members']()} (0)`} desc={t['Members hint']()}>
            <Button>{t['Invite Members']()}</Button>
          </SettingRow>
        </div>
      </Tooltip>
      <EnableCloudPanel onCloseSetting={onCloseSetting} />
    </div>
  );
};
