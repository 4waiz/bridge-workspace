import { Service } from '@kanban-studios/infra';

import { CloudDocMeta } from '../entities/cloud-doc-meta';

export class CloudDocMetaService extends Service {
  cloudDocMeta = this.framework.createEntity(CloudDocMeta);
}
