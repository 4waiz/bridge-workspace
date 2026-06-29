// corresponding to `formatText` command
import { TableModelFlavour } from '@blocksuite/bridgeflow-model';

export const FORMAT_TEXT_SUPPORT_FLAVOURS = [
  'bridgeflow:paragraph',
  'bridgeflow:list',
  'bridgeflow:code',
];
// corresponding to `formatBlock` command
export const FORMAT_BLOCK_SUPPORT_FLAVOURS = [
  'bridgeflow:paragraph',
  'bridgeflow:list',
  'bridgeflow:code',
];
// corresponding to `formatNative` command
export const FORMAT_NATIVE_SUPPORT_FLAVOURS = [
  'bridgeflow:database',
  TableModelFlavour,
];
