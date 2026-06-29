import { RefNodeSlotsProvider } from '@blocksuite/bridgeflow/inlines/reference';
import {
  CommunityCanvasTextFonts,
  DocModeProvider,
  EditorSettingExtension,
  FeatureFlagService,
  FontConfigExtension,
  ParseDocUrlExtension,
} from '@blocksuite/bridgeflow/shared/services';
import type { ExtensionType, Store, Workspace } from '@blocksuite/bridgeflow/store';
import { type TestBridgeFlowEditorContainer } from '@blocksuite/integration-test';
import { getTestViewManager } from '@blocksuite/integration-test/view';

import {
  mockDocModeService,
  mockEditorSetting,
  mockParseDocUrlService,
} from '../../_common/mock-services';

const viewManager = getTestViewManager();

export function getTestCommonExtensions(
  editor: TestBridgeFlowEditorContainer
): ExtensionType[] {
  return [
    FontConfigExtension(CommunityCanvasTextFonts),
    EditorSettingExtension({
      setting$: mockEditorSetting(),
    }),
    ParseDocUrlExtension(mockParseDocUrlService(editor.doc.workspace)),
    {
      setup: di => {
        di.override(DocModeProvider, mockDocModeService(editor));
      },
    },
    // CommentProviderExtension(mockCommentProvider()),
  ];
}

export function createTestEditor(store: Store, workspace: Workspace) {
  store
    .get(FeatureFlagService)
    .setFlag('enable_advanced_block_visibility', true);

  const editor = document.createElement('bridgeflow-editor-container');

  editor.autofocus = true;
  editor.doc = store;

  const defaultExtensions = getTestCommonExtensions(editor);
  editor.pageSpecs = [...viewManager.get('page'), ...defaultExtensions];
  editor.edgelessSpecs = [...viewManager.get('edgeless'), ...defaultExtensions];

  editor.std
    .get(RefNodeSlotsProvider)
    .docLinkClicked.subscribe(({ pageId: docId }) => {
      const target = workspace.getDoc(docId)?.getStore();
      if (!target) {
        throw new Error(`Failed to jump to doc ${docId}`);
      }
      target.load();
      editor.doc = target;
    });

  return editor;
}
