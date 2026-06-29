import { Slider } from './slider';
export * from './types';

export function effects() {
  customElements.define('bridgeflow-slider', Slider);
}
