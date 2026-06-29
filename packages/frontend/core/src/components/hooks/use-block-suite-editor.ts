import type { SetStateAction } from 'jotai';
import { atom, useAtom } from 'jotai';

import type { BridgeFlowEditorContainer } from '../../blocksuite/block-suite-editor';

const activeEditorContainerAtom = atom<BridgeFlowEditorContainer | null>(null);

export function useActiveBlocksuiteEditor(): [
  BridgeFlowEditorContainer | null,
  React.Dispatch<SetStateAction<BridgeFlowEditorContainer | null>>,
] {
  const [editorContainer, setEditorContainer] = useAtom(
    activeEditorContainerAtom
  );

  return [editorContainer, setEditorContainer];
}
