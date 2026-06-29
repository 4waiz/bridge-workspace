import { SurfaceBlockSchema } from '@blocksuite/bridgeflow/blocks/surface';
import { BlockService } from '@blocksuite/bridgeflow/std';

export class MindmapSurfaceBlockService extends BlockService {
  static override readonly flavour = SurfaceBlockSchema.model.flavour;
}
