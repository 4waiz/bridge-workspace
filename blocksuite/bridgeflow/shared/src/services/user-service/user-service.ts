import { createIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import type { Signal } from '@preact/signals-core';

import type { BridgeFlowUserInfo } from './types';

export interface UserService {
  currentUserInfo$: Signal<BridgeFlowUserInfo | null>;
  userInfo$(id: string): Signal<BridgeFlowUserInfo | null>;
  isLoading$(id: string): Signal<boolean>;
  error$(id: string): Signal<string | null>; // user friendly error string
  revalidateUserInfo(id: string): void;
}

export const UserProvider = createIdentifier<UserService>(
  'bridgeflow-user-service'
);

export function UserServiceExtension(service: UserService): ExtensionType {
  return {
    setup(di) {
      di.addImpl(UserProvider, () => service);
    },
  };
}
