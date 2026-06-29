import type * as Effect from '@blocksuite/bridgeflow/effects';
import type { EditorHost } from '@blocksuite/bridgeflow/std';
import type { Store, Transformer, Workspace } from '@blocksuite/bridgeflow/store';
import type { TestBridgeFlowEditorContainer } from '@blocksuite/integration-test';

declare type _GLOBAL_ = typeof Effect;

declare global {
  interface Window {
    /** Available on playground window
     * the following instance are initialized in `packages/playground/apps/starter/main.ts`
     */
    $blocksuite: {
      store: typeof import('@blocksuite/bridgeflow/store');
      blocks: {
        database: typeof import('@blocksuite/bridgeflow/blocks/database');
        note: typeof import('@blocksuite/bridgeflow/blocks/note');
      };
      global: {
        utils: typeof import('@blocksuite/bridgeflow/global/utils');
      };
      services: typeof import('@blocksuite/bridgeflow/shared/services');
      editor: typeof import('@blocksuite/integration-test');
      blockStd: typeof import('@blocksuite/bridgeflow/std');
      bridgeflowModel: typeof import('@blocksuite/bridgeflow-model');
    };
    collection: Workspace;
    doc: Store;
    editor: TestBridgeFlowEditorContainer;
    host: EditorHost;
    job: Transformer;
  }
}
