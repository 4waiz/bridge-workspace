export enum IconType {
  Emoji = 'emoji',
  BridgeFlowIcon = 'bridgeflow-icon',
  Blob = 'blob',
}

export type IconData =
  | {
      type: IconType.Emoji;
      unicode: string;
    }
  | {
      type: IconType.BridgeFlowIcon;
      name: string;
      color: string;
    }
  | {
      type: IconType.Blob;
      blob: Blob;
    };
