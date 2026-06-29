import { SurfaceBlockSchema } from '@blocksuite/bridgeflow/blocks/surface';
import { ConnectorElementRendererExtension } from '@blocksuite/bridgeflow/gfx/connector';
import {
  MindmapElementRendererExtension,
  MindMapView,
} from '@blocksuite/bridgeflow/gfx/mindmap';
import { ShapeElementRendererExtension } from '@blocksuite/bridgeflow/gfx/shape';
import { TextElementRendererExtension } from '@blocksuite/bridgeflow/gfx/text';
import { RootBlockSchema } from '@blocksuite/bridgeflow/model';
import {
  DocModeService,
  ThemeService,
} from '@blocksuite/bridgeflow/shared/services';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/bridgeflow/std';
import { ToolController } from '@blocksuite/bridgeflow/std/gfx';
import type { BlockSchema, ExtensionType } from '@blocksuite/bridgeflow/store';
import { literal } from 'lit/static-html.js';
import type { z } from 'zod';

import { MindmapService } from './mindmap-service.js';
import { MindmapSurfaceBlockService } from './surface-service.js';

export const MiniMindmapSpecs: ExtensionType[] = [
  DocModeService,
  ThemeService,
  FlavourExtension('bridgeflow:page'),
  MindmapService,
  ToolController,
  BlockViewExtension('bridgeflow:page', literal`mini-mindmap-root-block`),
  FlavourExtension('bridgeflow:surface'),
  MindMapView,
  MindmapSurfaceBlockService,
  BlockViewExtension('bridgeflow:surface', literal`mini-mindmap-surface-block`),
  TextElementRendererExtension,
  MindmapElementRendererExtension,
  ShapeElementRendererExtension,
  ConnectorElementRendererExtension,
];

export const MiniMindmapSchema: z.infer<typeof BlockSchema>[] = [
  RootBlockSchema,
  SurfaceBlockSchema,
];
