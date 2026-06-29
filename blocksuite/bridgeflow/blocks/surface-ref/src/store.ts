import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { SurfaceRefBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

export class SurfaceRefStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-surface-ref-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(SurfaceRefBlockSchemaExtension);
  }
}
