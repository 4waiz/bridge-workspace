import {
  type BridgeFlowCommand,
  BridgeFlowCommandRegistry,
  type CommandCategory,
  PreconditionStrategy,
} from '@bridgeflow/core/commands';
import type { DocMode } from '@blocksuite/bridgeflow/model';
import { Entity, LiveData } from '@kanban-studios/infra';
import Fuse from 'fuse.js';

import type { GlobalContextService } from '../../global-context';
import type { QuickSearchSession } from '../providers/quick-search-provider';
import type { QuickSearchGroup } from '../types/group';
import type { QuickSearchItem } from '../types/item';
import { highlighter } from '../utils/highlighter';

const categories = {
  'bridgeflow:recent': {
    id: 'command:bridgeflow:recent',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.recent' },
    score: 10,
  },
  'bridgeflow:navigation': {
    id: 'command:bridgeflow:navigation',
    label: {
      i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.navigation',
    },
    score: 10,
  },
  'bridgeflow:creation': {
    id: 'command:bridgeflow:creation',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.creation' },
    score: 10,
  },
  'bridgeflow:general': {
    id: 'command:bridgeflow:general',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.general' },
    score: 10,
  },
  'bridgeflow:layout': {
    id: 'command:bridgeflow:layout',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.layout' },
    score: 10,
  },
  'bridgeflow:pages': {
    id: 'command:bridgeflow:pages',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.pages' },
    score: 10,
  },
  'bridgeflow:edgeless': {
    id: 'command:bridgeflow:edgeless',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.edgeless' },
    score: 10,
  },
  'bridgeflow:collections': {
    id: 'command:bridgeflow:collections',
    label: {
      i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.collections',
    },
    score: 10,
  },
  'bridgeflow:settings': {
    id: 'command:bridgeflow:settings',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.settings' },
    score: 10,
  },
  'bridgeflow:updates': {
    id: 'command:bridgeflow:updates',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.updates' },
    score: 10,
  },
  'bridgeflow:help': {
    id: 'command:bridgeflow:help',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.bridgeflow.help' },
    score: 10,
  },
  'editor:edgeless': {
    id: 'command:editor:edgeless',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.editor.edgeless' },
    score: 10,
  },
  'editor:insert-object': {
    id: 'command:editor:insert-object',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.editor.insert-object' },
    score: 10,
  },
  'editor:page': {
    id: 'command:editor:page',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.editor.page' },
    score: 10,
  },
  'bridgeflow:results': {
    id: 'command:bridgeflow:results',
    label: { i18nKey: 'com.bridgeflow.cmdk.bridgeflow.category.results' },
    score: 10,
  },
} satisfies Required<{
  [key in CommandCategory]: QuickSearchGroup & { id: `command:${key}` };
}>;

function filterCommandByContext(
  command: BridgeFlowCommand,
  context: {
    docMode: DocMode | undefined;
  }
) {
  if (command.preconditionStrategy === PreconditionStrategy.Always) {
    return true;
  }
  if (command.preconditionStrategy === PreconditionStrategy.InEdgeless) {
    return context.docMode === 'edgeless';
  }
  if (command.preconditionStrategy === PreconditionStrategy.InPaper) {
    return context.docMode === 'page';
  }
  if (command.preconditionStrategy === PreconditionStrategy.InPaperOrEdgeless) {
    return !!context.docMode;
  }
  if (command.preconditionStrategy === PreconditionStrategy.Never) {
    return false;
  }
  if (typeof command.preconditionStrategy === 'function') {
    return command.preconditionStrategy();
  }
  return true;
}

function getAllCommand(context: { docMode: DocMode | undefined }) {
  const commands = BridgeFlowCommandRegistry.getAll();
  return commands.filter(command => {
    return filterCommandByContext(command, context);
  });
}

export class CommandsQuickSearchSession
  extends Entity
  implements QuickSearchSession<'commands', BridgeFlowCommand>
{
  constructor(private readonly contextService: GlobalContextService) {
    super();
  }

  query$ = new LiveData('');

  items$ = LiveData.computed(get => {
    const query = get(this.query$);
    const docMode =
      get(this.contextService.globalContext.docMode.$) ?? undefined;
    const commands = getAllCommand({ docMode });

    const fuse = new Fuse(commands, {
      keys: [{ name: 'label.title', weight: 2 }, 'label.subTitle'],
      includeMatches: true,
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.0,
    });

    const result = query
      ? fuse.search(query)
      : commands.map(item => ({ item, matches: [], score: 0 }));

    return result.map<QuickSearchItem<'commands', BridgeFlowCommand>>(
      ({ item, matches, score = 1 }) => {
        const normalizedRange = ([start, end]: [number, number]) =>
          [
            start,
            end + 1 /* in fuse, the `end` is different from the `substring` */,
          ] as [number, number];
        const titleMatches = matches
          ?.filter(match => match.key === 'label.title')
          .flatMap(match => match.indices.map(normalizedRange));
        const subTitleMatches = matches
          ?.filter(match => match.key === 'label.subTitle')
          .flatMap(match => match.indices.map(normalizedRange));

        return {
          id: 'command:' + item.id,
          source: 'commands',
          label: {
            title:
              highlighter(
                item.label.title,
                '<b>',
                '</b>',
                titleMatches ?? []
              ) ?? item.label.title,
            subTitle: item.label.subTitle
              ? (highlighter(
                  item.label.subTitle,
                  '<b>',
                  '</b>',
                  subTitleMatches ?? []
                ) ?? item.label.subTitle)
              : undefined,
          },
          group: categories[item.category],
          score:
            1 -
            score /* in fuse, the smaller the score, the better the match, so we need to reverse it */,
          icon: item.icon,
          keyBinding: item.keyBinding?.binding,
          payload: item,
        };
      }
    );
  });

  query(query: string) {
    this.query$.next(query);
  }
}
