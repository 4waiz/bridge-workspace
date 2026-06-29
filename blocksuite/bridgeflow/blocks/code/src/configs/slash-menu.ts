import { type SlashMenuConfig } from '@blocksuite/bridgeflow-widget-slash-menu';

export const codeSlashMenuConfig: SlashMenuConfig = {
  disableWhen: ({ model }) => {
    return model.flavour === 'bridgeflow:code';
  },
  items: [],
};
