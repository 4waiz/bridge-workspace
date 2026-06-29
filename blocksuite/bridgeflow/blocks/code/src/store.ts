import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/bridgeflow-ext-loader';
import { CodeBlockSchemaExtension } from '@blocksuite/bridgeflow-model';

import { CodeBlockAdapterExtensions } from './adapters/extension';
import { CodeMarkdownPreprocessorExtension } from './adapters/markdown/preprocessor';

export class CodeStoreExtension extends StoreExtensionProvider {
  override name = 'bridgeflow-code-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(CodeBlockSchemaExtension);
    context.register(CodeBlockAdapterExtensions);
    context.register(CodeMarkdownPreprocessorExtension);
  }
}
