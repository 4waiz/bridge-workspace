import {
  BRIDGEFLOW_FRAME_PANEL_BODY,
  FramePanelBody,
} from './body/frame-panel-body';
import { BRIDGEFLOW_FRAME_CARD, FrameCard } from './card/frame-card';
import {
  BRIDGEFLOW_FRAME_CARD_TITLE,
  FrameCardTitle,
} from './card/frame-card-title';
import {
  BRIDGEFLOW_FRAME_TITLE_EDITOR,
  FrameCardTitleEditor,
} from './card/frame-card-title-editor';
import { BRIDGEFLOW_FRAME_PREVIEW, FramePreview } from './card/frame-preview';
import { BRIDGEFLOW_FRAME_PANEL, FramePanel } from './frame-panel';
import {
  BRIDGEFLOW_FRAME_PANEL_HEADER,
  FramePanelHeader,
} from './header/frame-panel-header';
import {
  BRIDGEFLOW_FRAMES_SETTING_MENU,
  FramesSettingMenu,
} from './header/frames-setting-menu';

export function effects() {
  customElements.define(BRIDGEFLOW_FRAME_PANEL, FramePanel);
  customElements.define(BRIDGEFLOW_FRAME_TITLE_EDITOR, FrameCardTitleEditor);
  customElements.define(BRIDGEFLOW_FRAME_CARD, FrameCard);
  customElements.define(BRIDGEFLOW_FRAME_CARD_TITLE, FrameCardTitle);
  customElements.define(BRIDGEFLOW_FRAME_PANEL_BODY, FramePanelBody);
  customElements.define(BRIDGEFLOW_FRAME_PANEL_HEADER, FramePanelHeader);
  customElements.define(BRIDGEFLOW_FRAMES_SETTING_MENU, FramesSettingMenu);
  customElements.define(BRIDGEFLOW_FRAME_PREVIEW, FramePreview);
}
