import { RootBlockSchema } from '@blocksuite/bridgeflow/model';
import { BlockService } from '@blocksuite/bridgeflow/std';
import { Subject } from 'rxjs';

export class MindmapService extends BlockService {
  static override readonly flavour = RootBlockSchema.model.flavour;

  // eslint-disable-next-line rxjs/finnish
  requestCenter = new Subject<void>();

  center() {
    this.requestCenter.next();
  }

  override mounted(): void {}
}
