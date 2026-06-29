import { Button, Menu } from '@bridgeflow/component';
import { SettingHeader } from '@bridgeflow/component/setting-components';
import { useWorkspaceInfo } from '@bridgeflow/core/components/hooks/use-workspace-info';
import { WorkspacePropertyManager } from '@bridgeflow/core/components/properties/manager';
import { CreatePropertyMenuItems } from '@bridgeflow/core/components/properties/menu/create-doc-property';
import type { DocCustomPropertyInfo } from '@bridgeflow/core/modules/db';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { Trans, useI18n } from '@bridgeflow/i18n';
import track from '@bridgeflow/track';
import { FrameworkScope, useService } from '@kanban-studios/infra';
import { useCallback } from 'react';

import * as styles from './styles.css';

const WorkspaceSettingPropertiesMain = () => {
  const t = useI18n();

  const onCreated = useCallback((property: DocCustomPropertyInfo) => {
    track.$.settingsPanel.workspace.addProperty({
      type: property.type,
      control: 'at menu',
    });
  }, []);

  const onPropertyInfoChange = useCallback(
    (property: DocCustomPropertyInfo, field: string) => {
      track.$.settingsPanel.workspace.editPropertyMeta({
        type: property.type,
        field,
      });
    },
    []
  );

  return (
    <div className={styles.main}>
      <div className={styles.listHeader}>
        <Menu items={<CreatePropertyMenuItems onCreated={onCreated} />}>
          <Button variant="primary">
            {t['com.bridgeflow.settings.workspace.properties.add_property']()}
          </Button>
        </Menu>
      </div>
      <WorkspacePropertyManager onPropertyInfoChange={onPropertyInfoChange} />
    </div>
  );
};

export const WorkspaceSettingProperties = () => {
  const t = useI18n();
  const workspace = useService(WorkspaceService).workspace;
  const workspaceInfo = useWorkspaceInfo(workspace);
  const title = workspaceInfo?.name || 'untitled';

  if (workspace === null) {
    return null;
  }

  return (
    <FrameworkScope scope={workspace.scope}>
      <SettingHeader
        title={t['com.bridgeflow.settings.workspace.properties.header.title']()}
        subtitle={
          <Trans
            values={{
              name: title,
            }}
            i18nKey="com.bridgeflow.settings.workspace.properties.header.subtitle"
          >
            Manage workspace <strong>name</strong> properties
          </Trans>
        }
      />
      <WorkspaceSettingPropertiesMain />
    </FrameworkScope>
  );
};
