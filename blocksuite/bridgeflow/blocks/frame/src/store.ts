import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { FrameBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

export class FrameStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-frame-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register([FrameBlockSchemaExtension]);
  }
}
