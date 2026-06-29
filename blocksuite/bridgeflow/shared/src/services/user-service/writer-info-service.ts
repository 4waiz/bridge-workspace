import { createIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';

import type { BridgeFlowUserInfo } from './types';

export interface WriterInfoService {
  getWriterInfo(): BridgeFlowUserInfo | null;
}

export const WriterInfoProvider = createIdentifier<WriterInfoService>(
  'bridgeflow-writer-info-service'
);

export function WriterInfoServiceExtension(
  service: WriterInfoService
): ExtensionType {
  return {
    setup(di) {
      di.addImpl(WriterInfoProvider, () => service);
    },
  };
}
