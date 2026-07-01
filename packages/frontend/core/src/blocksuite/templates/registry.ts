import { buildAiFlowBuilderBoard } from './ai-flow-builder';
import { buildBusinessModelCanvasBoard } from './business-model-canvas';
import { buildCustomerJourneyBoard } from './customer-journey';
import type { TemplateBuilder } from './kit';
import { buildOkrBoard } from './okr-board';
import { buildProductStrategyBoard } from './product-strategy';
import { buildResearchSynthesisBoard } from './research-synthesis';
import { buildRoadmapBoard } from './roadmap';
import { buildSprintPlanningBoard } from './sprint-planning';
import { buildWorkshopCanvasBoard } from './workshop-canvas';

/**
 * Central registry of BRIDGE Flow board templates. Each entry knows the doc
 * title to create and the builder that draws the board onto the fresh edgeless
 * surface. The home screen looks templates up by id so every tile opens its own
 * real board instead of a blank canvas.
 */
export interface TemplateDefinition {
  id: string;
  title: string;
  /** Primary editor mode for the created doc. All current templates are boards. */
  mode: 'edgeless' | 'page';
  build: TemplateBuilder;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  'okr-quarterly-plan': {
    id: 'okr-quarterly-plan',
    title: 'OKR Quarterly Plan',
    mode: 'edgeless',
    build: buildOkrBoard,
  },
  'product-strategy': {
    id: 'product-strategy',
    title: 'Product Strategy',
    mode: 'edgeless',
    build: buildProductStrategyBoard,
  },
  'sprint-planning': {
    id: 'sprint-planning',
    title: 'Sprint Planning',
    mode: 'edgeless',
    build: buildSprintPlanningBoard,
  },
  'research-synthesis': {
    id: 'research-synthesis',
    title: 'Research Synthesis',
    mode: 'edgeless',
    build: buildResearchSynthesisBoard,
  },
  'workshop-canvas': {
    id: 'workshop-canvas',
    title: 'Workshop Canvas',
    mode: 'edgeless',
    build: buildWorkshopCanvasBoard,
  },
  'customer-journey': {
    id: 'customer-journey',
    title: 'Customer Journey Map',
    mode: 'edgeless',
    build: buildCustomerJourneyBoard,
  },
  'ai-flow-builder': {
    id: 'ai-flow-builder',
    title: 'AI Flow Builder',
    mode: 'edgeless',
    build: buildAiFlowBuilderBoard,
  },
  roadmap: {
    id: 'roadmap',
    title: 'Roadmap',
    mode: 'edgeless',
    build: buildRoadmapBoard,
  },
  'business-model': {
    id: 'business-model',
    title: 'Business Model Canvas',
    mode: 'edgeless',
    build: buildBusinessModelCanvasBoard,
  },
};

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY[id];
}
