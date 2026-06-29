import {
  BRIDGEFLOW_EDGELESS_AUTO_CONNECT_WIDGET,
  EdgelessAutoConnectWidget,
} from '.';

export function effects() {
  customElements.define(
    BRIDGEFLOW_EDGELESS_AUTO_CONNECT_WIDGET,
    EdgelessAutoConnectWidget
  );
}
