import type { OpSchema } from '@kanban-studios/infra/op';

export interface WorkerOps extends OpSchema {
  renderWorkspaceProfile: [Uint8Array[], { name?: string; avatar?: string }];
}
