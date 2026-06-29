import type { PackageName } from '@bridgeflow-tools/utils/workspace';

import { Option, PackageSelectorCommand } from './command';

export class DevCommand extends PackageSelectorCommand {
  static override paths = [['dev'], ['d']];

  protected override availablePackages: PackageName[] = [
    '@bridgeflow/web',
    '@bridgeflow/server',
    '@bridgeflow/electron',
    '@bridgeflow/electron-renderer',
    '@bridgeflow/mobile',
    '@bridgeflow/ios',
    '@bridgeflow/android',
    '@bridgeflow/admin',
  ];

  protected deps = Option.Boolean('--deps', {
    description: 'Run dev with dependencies',
  });

  async execute() {
    const name = await this.getPackage();
    const args = [];

    if (this.deps) {
      args.push('--deps');
    }

    args.push(name, 'dev');

    await this.cli.run(args);
  }
}
