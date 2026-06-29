import { createIdentifier, type Memento } from '@kanban-studios/infra';

export interface AppSidebarState extends Memento {}

export const AppSidebarState =
  createIdentifier<AppSidebarState>('AppSidebarState');
