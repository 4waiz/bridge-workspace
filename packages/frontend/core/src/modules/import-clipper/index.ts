import { type Framework } from '@kanban-studios/infra';

import { WorkspacesService } from '../workspace';
import { ImportClipperService } from './services/import';

export { type ClipperInput, ImportClipperService } from './services/import';

export function configureImportClipperModule(framework: Framework) {
  framework.service(ImportClipperService, [WorkspacesService]);
}
