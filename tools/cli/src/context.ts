import type { Workspace } from '@bridgeflow-tools/utils/workspace';
import type { BaseContext } from 'clipanion';

export interface CliContext extends BaseContext {
  workspace: Workspace;
}
