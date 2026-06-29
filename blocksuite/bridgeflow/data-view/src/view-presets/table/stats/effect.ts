import { DataBaseColumnStats } from './column-stats-bar.js';
import { DatabaseColumnStatsCell } from './column-stats-column.js';

export function statsEffects() {
  customElements.define('bridgeflow-database-column-stats', DataBaseColumnStats);
  customElements.define(
    'bridgeflow-database-column-stats-cell',
    DatabaseColumnStatsCell
  );
}
