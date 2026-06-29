import { BRIDGEFLOW_OUTLINE_NOTICE, OutlineNotice } from './body/outline-notice';
import {
  BRIDGEFLOW_OUTLINE_PANEL_BODY,
  OutlinePanelBody,
} from './body/outline-panel-body';
import { BRIDGEFLOW_OUTLINE_NOTE_CARD, OutlineNoteCard } from './card/outline-card';
import {
  BRIDGEFLOW_OUTLINE_BLOCK_PREVIEW,
  OutlineBlockPreview,
} from './card/outline-preview';
import {
  BRIDGEFLOW_OUTLINE_PANEL_HEADER,
  OutlinePanelHeader,
} from './header/outline-panel-header';
import {
  BRIDGEFLOW_OUTLINE_NOTE_PREVIEW_SETTING_MENU,
  OutlineNotePreviewSettingMenu,
} from './header/outline-setting-menu';
import {
  BRIDGEFLOW_MOBILE_OUTLINE_MENU,
  MobileOutlineMenu,
} from './mobile-outline-panel';
import { BRIDGEFLOW_OUTLINE_PANEL, OutlinePanel } from './outline-panel';
import { BRIDGEFLOW_OUTLINE_VIEWER, OutlineViewer } from './outline-viewer';

export function effects() {
  customElements.define(
    BRIDGEFLOW_OUTLINE_NOTE_PREVIEW_SETTING_MENU,
    OutlineNotePreviewSettingMenu
  );
  customElements.define(BRIDGEFLOW_OUTLINE_NOTICE, OutlineNotice);
  customElements.define(BRIDGEFLOW_OUTLINE_PANEL, OutlinePanel);
  customElements.define(BRIDGEFLOW_OUTLINE_PANEL_HEADER, OutlinePanelHeader);
  customElements.define(BRIDGEFLOW_OUTLINE_NOTE_CARD, OutlineNoteCard);
  customElements.define(BRIDGEFLOW_OUTLINE_VIEWER, OutlineViewer);
  customElements.define(BRIDGEFLOW_MOBILE_OUTLINE_MENU, MobileOutlineMenu);
  customElements.define(BRIDGEFLOW_OUTLINE_BLOCK_PREVIEW, OutlineBlockPreview);
  customElements.define(BRIDGEFLOW_OUTLINE_PANEL_BODY, OutlinePanelBody);
}
