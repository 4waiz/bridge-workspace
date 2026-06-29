import { Entity } from '@kanban-studios/infra';

export class SidebarTab extends Entity<{ id: string }> {
  readonly id = this.props.id;
}
