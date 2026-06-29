import { Service } from '@kanban-studios/infra';

import { TemplateDownloader } from '../entities/downloader';

export class TemplateDownloaderService extends Service {
  downloader = this.framework.createEntity(TemplateDownloader);
}
