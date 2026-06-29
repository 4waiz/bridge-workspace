import { toast } from '@bridgeflow/component';
import {
  pushGlobalLoadingEventAtom,
  resolveGlobalLoadingEventAtom,
} from '@bridgeflow/component/global-loading';
import {
  AIProvider,
  CopilotClient,
  setupAIProvider,
} from '@bridgeflow/core/blocksuite/ai';
import { useRegisterFindInPageCommands } from '@bridgeflow/core/components/hooks/bridgeflow/use-register-find-in-page-commands';
import { useRegisterWorkspaceCommands } from '@bridgeflow/core/components/hooks/use-register-workspace-commands';
import { OverCapacityNotification } from '@bridgeflow/core/components/over-capacity';
import {
  AuthService,
  EventSourceService,
  GraphQLService,
} from '@bridgeflow/core/modules/cloud';
import {
  GlobalDialogService,
  WorkspaceDialogService,
} from '@bridgeflow/core/modules/dialogs';
import { DocsService } from '@bridgeflow/core/modules/doc';
import { EditorSettingService } from '@bridgeflow/core/modules/editor-setting';
import { useRegisterNavigationCommands } from '@bridgeflow/core/modules/navigation/view/use-register-navigation-commands';
import { QuickSearchContainer } from '@bridgeflow/core/modules/quicksearch';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import {
  getBridgeFlowWorkspaceSchema,
  WorkspaceService,
} from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import track from '@bridgeflow/track';
import type { DocMode } from '@blocksuite/bridgeflow/model';
import { ZipTransformer } from '@blocksuite/bridgeflow/widgets/linked-doc';
import {
  effect,
  fromPromise,
  onStart,
  throwIfAborted,
  useService,
  useServices,
} from '@kanban-studios/infra';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { catchError, EMPTY, finalize, switchMap, tap, timeout } from 'rxjs';

/**
 * @deprecated just for legacy code, will be removed in the future
 */
export const WorkspaceSideEffects = () => {
  const t = useI18n();
  const pushGlobalLoadingEvent = useSetAtom(pushGlobalLoadingEventAtom);
  const resolveGlobalLoadingEvent = useSetAtom(resolveGlobalLoadingEventAtom);
  const { workspaceService, docsService } = useServices({
    WorkspaceService,
    DocsService,
    EditorSettingService,
  });
  const currentWorkspace = workspaceService.workspace;
  const docsList = docsService.list;

  const workbench = useService(WorkbenchService).workbench;
  useEffect(() => {
    const insertTemplate = effect(
      switchMap(({ template, mode }: { template: string; mode: string }) => {
        return fromPromise(async abort => {
          const templateZip = await fetch(template, { signal: abort });
          const templateBlob = await templateZip.blob();
          throwIfAborted(abort);
          const [doc] = await ZipTransformer.importDocs(
            currentWorkspace.docCollection,
            getBridgeFlowWorkspaceSchema(),
            templateBlob
          );
          if (doc) {
            doc.resetHistory();
          }

          return { doc, mode };
        }).pipe(
          timeout(10000 /* 10s */),
          tap(({ mode, doc }) => {
            if (doc) {
              docsList.setPrimaryMode(doc.id, mode as DocMode);
              workbench.openDoc(doc.id);
            }
          }),
          onStart(() => {
            pushGlobalLoadingEvent({
              key: 'insert-template',
            });
          }),
          catchError(err => {
            console.error(err);
            toast(t['com.bridgeflow.ai.template-insert.failed']());
            return EMPTY;
          }),
          finalize(() => {
            resolveGlobalLoadingEvent('insert-template');
          })
        );
      })
    );

    const disposable = AIProvider.slots.requestInsertTemplate.subscribe(
      ({ template, mode }) => {
        insertTemplate({ template, mode });
      }
    );

    return () => {
      disposable.unsubscribe();
      insertTemplate.unsubscribe();
    };
  }, [
    currentWorkspace.docCollection,
    docsList,
    pushGlobalLoadingEvent,
    resolveGlobalLoadingEvent,
    t,
    workbench,
  ]);

  const workspaceDialogService = useService(WorkspaceDialogService);
  const globalDialogService = useService(GlobalDialogService);

  useEffect(() => {
    const disposable = AIProvider.slots.requestUpgradePlan.subscribe(() => {
      workspaceDialogService.open('setting', {
        activeTab: 'billing',
      });
      track.$.paywall.aiAction.viewPlans();
    });
    return () => {
      disposable.unsubscribe();
    };
  }, [workspaceDialogService]);

  const graphqlService = useService(GraphQLService);
  const eventSourceService = useService(EventSourceService);
  const authService = useService(AuthService);

  useEffect(() => {
    const dispose = setupAIProvider(
      new CopilotClient(graphqlService.gql, eventSourceService.eventSource),
      globalDialogService,
      authService
    );
    return () => {
      dispose();
    };
  }, [
    eventSourceService,
    workspaceDialogService,
    graphqlService,
    globalDialogService,
    authService,
  ]);

  useRegisterWorkspaceCommands();
  useRegisterNavigationCommands();
  useRegisterFindInPageCommands();

  return (
    <>
      <QuickSearchContainer />
      <OverCapacityNotification />
    </>
  );
};
