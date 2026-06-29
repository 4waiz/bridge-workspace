import { AttachmentBlockModel } from '@blocksuite/bridgeflow/model';
import type { BlockModel } from '@blocksuite/bridgeflow/store';
import type { GfxModel } from '@blocksuite/std/gfx';

export function isAttachment(
  model: GfxModel | BlockModel
): model is AttachmentBlockModel {
  return model instanceof AttachmentBlockModel;
}
