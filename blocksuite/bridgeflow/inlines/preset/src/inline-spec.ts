import type { BridgeFlowTextAttributes } from '@blocksuite/bridgeflow-shared/types';
import {
  type InlineRootElement,
  InlineSpecExtension,
} from '@blocksuite/std/inline';
import type { ExtensionType } from '@blocksuite/store';
import { html } from 'lit';
import { z } from 'zod';

export type BridgeFlowInlineRootElement = InlineRootElement<BridgeFlowTextAttributes>;

export const BoldInlineSpecExtension =
  InlineSpecExtension<BridgeFlowTextAttributes>({
    name: 'bold',
    schema: z.object({
      bold: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.bold;
    },
    renderer: ({ delta }) => {
      return html`<bridgeflow-text .delta=${delta}></bridgeflow-text>`;
    },
  });

export const ItalicInlineSpecExtension =
  InlineSpecExtension<BridgeFlowTextAttributes>({
    name: 'italic',
    schema: z.object({
      italic: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.italic;
    },
    renderer: ({ delta }) => {
      return html`<bridgeflow-text .delta=${delta}></bridgeflow-text>`;
    },
  });

export const UnderlineInlineSpecExtension =
  InlineSpecExtension<BridgeFlowTextAttributes>({
    name: 'underline',
    schema: z.object({
      underline: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.underline;
    },
    renderer: ({ delta }) => {
      return html`<bridgeflow-text .delta=${delta}></bridgeflow-text>`;
    },
  });

export const StrikeInlineSpecExtension =
  InlineSpecExtension<BridgeFlowTextAttributes>({
    name: 'strike',
    schema: z.object({
      strike: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.strike;
    },
    renderer: ({ delta }) => {
      return html`<bridgeflow-text .delta=${delta}></bridgeflow-text>`;
    },
  });

export const CodeInlineSpecExtension =
  InlineSpecExtension<BridgeFlowTextAttributes>({
    name: 'inline-code',
    schema: z.object({
      code: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.code;
    },
    renderer: ({ delta }) => {
      return html`<bridgeflow-text .delta=${delta}></bridgeflow-text>`;
    },
  });

export const BackgroundInlineSpecExtension =
  InlineSpecExtension<BridgeFlowTextAttributes>({
    name: 'background',
    schema: z.object({
      background: z.string().optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.background;
    },
    renderer: ({ delta }) => {
      return html`<bridgeflow-text .delta=${delta}></bridgeflow-text>`;
    },
  });

export const ColorInlineSpecExtension =
  InlineSpecExtension<BridgeFlowTextAttributes>({
    name: 'color',
    schema: z.object({
      color: z.string().optional().nullable().catch(undefined),
    }),
    match: delta => {
      return !!delta.attributes?.color;
    },
    renderer: ({ delta }) => {
      return html`<bridgeflow-text .delta=${delta}></bridgeflow-text>`;
    },
  });

export const InlineSpecExtensions: ExtensionType[] = [
  BoldInlineSpecExtension,
  ItalicInlineSpecExtension,
  UnderlineInlineSpecExtension,
  StrikeInlineSpecExtension,
  CodeInlineSpecExtension,
  BackgroundInlineSpecExtension,
  ColorInlineSpecExtension,
];
