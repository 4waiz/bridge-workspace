import type { FrameBlockModel } from '@blocksuite/bridgeflow/model';
import type { Store } from '@blocksuite/bridgeflow/store';

export function getFrameBlock(doc: Store) {
  const blocks = doc.getBlocksByFlavour('bridgeflow:frame');
  return blocks.length !== 0 ? (blocks[0].model as FrameBlockModel) : null;
}
