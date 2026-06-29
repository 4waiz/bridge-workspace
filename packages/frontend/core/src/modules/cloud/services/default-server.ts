import { ServerDeploymentType } from '@bridgeflow/graphql';
import { Service } from '@toeverything/infra';

import type { Server } from '../entities/server';
import type { ServersService } from './servers';

export class DefaultServerService extends Service {
  readonly server: Server;

  constructor(private readonly serversService: ServersService) {
    super();

    // global server is always bridgeflow-cloud
    const server = this.serversService.server$('bridgeflow-cloud').value;
    if (!server) {
      throw new Error('No server found');
    }
    this.server = server;
  }

  async waitForSelfhostedServerConfig() {
    if (this.server.config$.value.type === ServerDeploymentType.Selfhosted) {
      await this.server.waitForConfigRevalidation();
    }
  }
}
