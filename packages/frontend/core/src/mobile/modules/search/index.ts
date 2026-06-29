import { WorkspaceScope } from '@bridgeflow/core/modules/workspace';
import { type Framework } from '@kanban-studios/infra';

import { MobileSearchService } from './service/search';

export { MobileSearchService };

export function configureMobileSearchModule(framework: Framework) {
  framework.scope(WorkspaceScope).service(MobileSearchService);
}
