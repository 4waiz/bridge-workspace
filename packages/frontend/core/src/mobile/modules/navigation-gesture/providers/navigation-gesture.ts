import { createIdentifier } from '@kanban-studios/infra';

export interface NavigationGestureProvider {
  isEnabled: () => boolean;
  enable: () => void;
  disable: () => void;
}

export const NavigationGestureProvider =
  createIdentifier<NavigationGestureProvider>('NavigationGestureProvider');
