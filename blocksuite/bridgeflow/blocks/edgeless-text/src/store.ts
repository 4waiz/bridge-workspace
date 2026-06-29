import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { EdgelessTextBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

export class EdgelessTextStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-edgeless-text-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(EdgelessTextBlockSchemaExtension);
  }
}
