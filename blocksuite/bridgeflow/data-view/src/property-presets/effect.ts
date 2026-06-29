import { CheckboxCell } from './checkbox/cell-renderer.js';
import { DateCell } from './date/cell-renderer.js';
import { ImageCell } from './image/cell-renderer.js';
import { MultiSelectCell } from './multi-select/cell-renderer.js';
import { NumberCell } from './number/cell-renderer.js';
import { ProgressCell } from './progress/cell-renderer.js';
import { SelectCell } from './select/cell-renderer.js';
import { TextCell } from './text/cell-renderer.js';

export function propertyPresetsEffects() {
  customElements.define('bridgeflow-database-checkbox-cell', CheckboxCell);
  customElements.define('bridgeflow-database-date-cell', DateCell);
  customElements.define('bridgeflow-database-image-cell', ImageCell);
  customElements.define('bridgeflow-database-multi-select-cell', MultiSelectCell);
  customElements.define('bridgeflow-database-number-cell', NumberCell);
  customElements.define('bridgeflow-database-progress-cell', ProgressCell);
  customElements.define('bridgeflow-database-select-cell', SelectCell);
  customElements.define('bridgeflow-database-text-cell', TextCell);
}
