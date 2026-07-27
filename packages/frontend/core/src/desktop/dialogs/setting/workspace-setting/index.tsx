import {
  CollaborationIcon,
  PaymentIcon,
  PropertyIcon,
  SettingsIcon,
} from '@blocksuite/icons/rc';
import { useWorkspaceInfo } from '@bridgeflow/core/components/hooks/use-workspace-info';
import { ServerService } from '@bridgeflow/core/modules/cloud';
import type { SettingTab } from '@bridgeflow/core/modules/dialogs/constant';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { ServerDeploymentType } from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import { useLiveData, useService } from '@kanban-studios/infra';
import { useMemo } from 'react';

import type { SettingSidebarItem, SettingState } from '../types';
import { WorkspaceSettingBilling } from './billing';
import { MembersPanel } from './members';
import { WorkspaceSettingDetail } from './preference';
import { WorkspaceSettingProperties } from './properties';

export const WorkspaceSetting = ({
  activeTab,
  onCloseSetting,
  onChangeSettingState,
}: {
  activeTab: SettingTab;
  onCloseSetting: () => void;
  onChangeSettingState: (settingState: SettingState) => void;
}) => {
  switch (activeTab) {
    case 'workspace:preference':
      return <WorkspaceSettingDetail onCloseSetting={onCloseSetting} />;
    case 'workspace:properties':
      return <WorkspaceSettingProperties />;
    case 'workspace:members':
      return (
        <MembersPanel
          onCloseSetting={onCloseSetting}
          onChangeSettingState={onChangeSettingState}
        />
      );
    case 'workspace:billing':
      return <WorkspaceSettingBilling />;
    default:
      return null;
  }
};

export const useWorkspaceSettingList = (): SettingSidebarItem[] => {
  const workspaceService = useService(WorkspaceService);
  const information = useWorkspaceInfo(workspaceService.workspace);
  const serverService = useService(ServerService);

  const isSelfhosted = useLiveData(
    serverService.server.config$.selector(
      c => c.type === ServerDeploymentType.Selfhosted
    )
  );

  const t = useI18n();

  const showBilling =
    !isSelfhosted && information?.isTeam && information?.isOwner;
  const items = useMemo<SettingSidebarItem[]>(() => {
    return [
      {
        key: 'workspace:preference',
        title: t['com.bridgeflow.settings.workspace.preferences'](),
        icon: <SettingsIcon />,
        testId: 'workspace-setting:preference',
      },
      {
        key: 'workspace:properties',
        title: t['com.bridgeflow.settings.workspace.properties'](),
        icon: <PropertyIcon />,
        testId: 'workspace-setting:properties',
      },
      {
        key: 'workspace:members',
        title: t['Members'](),
        icon: <CollaborationIcon />,
        testId: 'workspace-setting:members',
      },
      showBilling && {
        key: 'workspace:billing' as SettingTab,
        title: t['com.bridgeflow.settings.workspace.billing'](),
        icon: <PaymentIcon />,
        testId: 'workspace-setting:billing',
      },
    ].filter((item): item is SettingSidebarItem => !!item);
  }, [showBilling, t]);

  return items;
};
