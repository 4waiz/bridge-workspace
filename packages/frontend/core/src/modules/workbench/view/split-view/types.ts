import type { BridgeFlowDNDEntity } from '@bridgeflow/core/types/dnd';

export const allowedSplitViewEntityTypes: Set<BridgeFlowDNDEntity['type']> =
  new Set(['doc', 'collection', 'tag']);

export const inferToFromEntity = (entity: BridgeFlowDNDEntity) => {
  if (entity.type === 'doc') {
    return `/${entity.id}`;
  } else if (entity.type === 'collection') {
    return `/collection/${entity.id}`;
  } else if (entity.type === 'tag') {
    return `/tag/${entity.id}`;
  }
  return null;
};
