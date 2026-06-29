import { AIChatBlockSchemaExtension } from '@bridgeflow/core/blocksuite/ai/blocks';
import { TranscriptionBlockSchemaExtension } from '@bridgeflow/core/blocksuite/ai/blocks/transcription-block/model';
import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow/ext-loader';

export class AIStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-store-extensions';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(AIChatBlockSchemaExtension);
    context.register(TranscriptionBlockSchemaExtension);
  }
}
