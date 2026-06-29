import { MenuItem } from '@bridgeflow/component/ui/menu';
import { DefaultServerService } from '@bridgeflow/core/modules/cloud';
import { ServerFeature } from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import { ImportIcon, PlusIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@kanban-studios/infra';

import * as styles from './index.css';

export const AddWorkspace = ({
  onAddWorkspace,
  onNewWorkspace,
}: {
  onAddWorkspace?: () => void;
  onNewWorkspace?: () => void;
}) => {
  const t = useI18n();
  const defaultServerService = useService(DefaultServerService);
  const enableLocalWorkspace = useLiveData(
    defaultServerService.server.config$.selector(
      c =>
        c.features.includes(ServerFeature.LocalWorkspace) ||
        BUILD_CONFIG.isNative
    )
  );

  return (
    <>
      {BUILD_CONFIG.isElectron && (
        <MenuItem
          block={true}
          prefixIcon={<ImportIcon />}
          prefixIconClassName={styles.prefixIcon}
          onClick={onAddWorkspace}
          data-testid="add-workspace"
          className={styles.ItemContainer}
        >
          <div className={styles.ItemText}>
            {t['com.bridgeflow.workspace.local.import']()}
          </div>
        </MenuItem>
      )}
      <MenuItem
        block={true}
        prefixIcon={<PlusIcon />}
        prefixIconClassName={styles.prefixIcon}
        onClick={onNewWorkspace}
        data-testid="new-workspace"
        className={styles.ItemContainer}
      >
        <div className={styles.ItemText}>
          {enableLocalWorkspace
            ? t['com.bridgeflow.workspaceList.addWorkspace.create']()
            : t['com.bridgeflow.workspaceList.addWorkspace.create-cloud']()}
        </div>
      </MenuItem>
    </>
  );
};
