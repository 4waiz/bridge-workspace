import type { ReferenceInfo } from '@blocksuite/bridgeflow-model';
import type { OpenDocMode } from '@blocksuite/bridgeflow-shared/services';
import { createIdentifier } from '@blocksuite/global/di';
import type { EditorHost } from '@blocksuite/std';
import type { ExtensionType } from '@blocksuite/store';
import { Subject } from 'rxjs';

export type DocLinkClickedEvent = ReferenceInfo & {
  // default is active view
  openMode?: OpenDocMode;
  event?: MouseEvent;
  host: EditorHost;
};

export type RefNodeSlots = {
  docLinkClicked: Subject<DocLinkClickedEvent>;
};

export const RefNodeSlotsProvider =
  createIdentifier<RefNodeSlots>('BridgeFlowRefNodeSlots');

const slots: RefNodeSlots = {
  docLinkClicked: new Subject(),
};

export const RefNodeSlotsExtension: ExtensionType = {
  setup: di => {
    di.addImpl(RefNodeSlotsProvider, () => slots);
  },
};
