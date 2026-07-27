import { SettingHeader } from '@bridgeflow/component/setting-components';
import { BridgeFlowErrorBoundary } from '@bridgeflow/core/components/bridgeflow/bridgeflow-error-boundary';
import { useWorkspaceInfo } from '@bridgeflow/core/components/hooks/use-workspace-info';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { useService } from '@kanban-studios/infra';
import { type ReactElement, useEffect, useState } from 'react';

import {
  fetchMembers,
  type Member,
} from '../../../../pages/okr-dashboard/okr-data';
import type { SettingState } from '../../types';
import { CloudWorkspaceMembersPanel } from './cloud-members-panel';
import * as styles from './styles.css';

export const MembersPanel = ({
  onChangeSettingState,
}: {
  onChangeSettingState: (settingState: SettingState) => void;
  onCloseSetting: () => void;
}): ReactElement | null => {
  const workspace = useService(WorkspaceService).workspace;
  const isTeam = useWorkspaceInfo(workspace.meta)?.isTeam;
  if (workspace.flavour === 'local') {
    return <DirectoryMembersPanel />;
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

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map(p => p[0]);
  return letters.join('').toUpperCase() || '?';
}

/**
 * The real member directory: everyone who has signed in, read from the Supabase
 * `profiles` table alongside the team they belong to. This workspace is local
 * (the cloud sync is disabled), so the cloud invite flow does not apply —
 * accounts are created by signing up, and this lists who has.
 */
const DirectoryMembersPanel = () => {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMembers()
      .then(list => {
        if (!cancelled) setMembers(list);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load members.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = members?.length ?? 0;

  return (
    <div className={styles.localMembersPanel}>
      <SettingHeader
        title={`Members${members ? ` (${count})` : ''}`}
        subtitle="Everyone with a BRIDGE Flow account, and the team they belong to."
      />

      {error ? (
        <div className={styles.directoryEmpty}>{error}</div>
      ) : !members ? (
        <div className={styles.directoryEmpty}>Loading members...</div>
      ) : count === 0 ? (
        <div className={styles.directoryEmpty}>
          No one has signed up yet. Members appear here once they create an
          account.
        </div>
      ) : (
        <div className={styles.directoryList}>
          {members.map(member => {
            const name = member.full_name?.trim() || 'Unnamed member';
            return (
              <div className={styles.directoryRow} key={member.id}>
                <div
                  className={styles.directoryAvatar}
                  style={{
                    background: member.team_accent ?? '#f15a29',
                  }}
                >
                  {initials(name)}
                </div>
                <div className={styles.directoryName}>
                  <span className={styles.directoryNameText}>{name}</span>
                  {member.is_admin ? (
                    <span className={styles.directoryAdmin}>Admin</span>
                  ) : null}
                </div>
                <div className={styles.directoryTeam}>
                  {member.team_name ?? 'No team'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
