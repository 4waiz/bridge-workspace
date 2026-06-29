import { Service } from '@kanban-studios/infra';

import { GlobalContext } from '../entities/global-context';

export class GlobalContextService extends Service {
  globalContext = this.framework.createEntity(GlobalContext);
}
