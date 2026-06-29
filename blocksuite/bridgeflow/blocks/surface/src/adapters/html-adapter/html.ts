import {
  BlockHtmlAdapterExtension,
  type BlockHtmlAdapterMatcher,
} from '@blocksuite/bridgeflow-shared/adapters';

export const surfaceBlockHtmlAdapterMatcher: BlockHtmlAdapterMatcher = {
  flavour: 'bridgeflow:surface',
  toMatch: () => false,
  fromMatch: o => o.node.flavour === 'bridgeflow:surface',
  toBlockSnapshot: {},
  fromBlockSnapshot: {
    enter: (_, context) => {
      context.walkerContext.skipAllChildren();
    },
  },
};

export const SurfaceBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  surfaceBlockHtmlAdapterMatcher
);
