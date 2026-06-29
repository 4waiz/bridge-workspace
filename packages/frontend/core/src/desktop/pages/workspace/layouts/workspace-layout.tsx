import { uniReactRoot } from '@bridgeflow/component';
import { AiLoginRequiredModal } from '@bridgeflow/core/components/bridgeflow/auth/ai-login-required';
import { useResponsiveSidebar } from '@bridgeflow/core/components/hooks/use-responsive-siedebar';
import { SWRConfigProvider } from '@bridgeflow/core/components/providers/swr-config-provider';
import { WorkspaceSideEffects } from '@bridgeflow/core/components/providers/workspace-side-effects';
import { AIIsland } from '@bridgeflow/core/desktop/components/ai-island';
import { AppContainer } from '@bridgeflow/core/desktop/components/app-container';
import { BridgeFlowAssistant } from '@bridgeflow/core/desktop/components/bridge-flow-assistant';
import { DocumentTitle } from '@bridgeflow/core/desktop/components/document-title';
import { WorkspaceDialogs } from '@bridgeflow/core/desktop/dialogs';
import { DocsService } from '@bridgeflow/core/modules/doc';
import { OrganizeService } from '@bridgeflow/core/modules/organize';
import { PeekViewManagerModal } from '@bridgeflow/core/modules/peek-view';
import { QuotaCheck } from '@bridgeflow/core/modules/quota';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { LiveData, useLiveData, useService } from '@kanban-studios/infra';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

export const WorkspaceLayout = function WorkspaceLayout({
  children,
}: PropsWithChildren) {
  const currentWorkspace = useService(WorkspaceService).workspace;
  const currentWorkspaceName = useLiveData(currentWorkspace?.name$);

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.flavour !== 'local') {
      return;
    }

    if (currentWorkspaceName === 'Demo Workspace') {
      currentWorkspace.setName('BRIDGE Flow');
    }

    const docsService = currentWorkspace.scope.get(DocsService);
    const organizeService = currentWorkspace.scope.get(OrganizeService);

    const renameStarterDocs = async () => {
      const bridgeWorkspaceDoc = docsService.list.docs$.value.find(doc =>
        doc.title$.value.startsWith('Getting Started')
      );
      const foldersDoc = docsService.list.docs$.value.find(doc =>
        doc.title$.value.startsWith('How to use folder and Tags')
      );

      if (bridgeWorkspaceDoc) {
        await docsService.changeDocTitle(
          bridgeWorkspaceDoc.id,
          'BRIDGE Flow'
        );
      }

      if (foldersDoc) {
        await docsService.changeDocTitle(
          foldersDoc.id,
          'Using Folders and Tags'
        );
      }
    };

    const renameStarterFolder = () => {
      const demoFolder =
        organizeService.folderTree.rootFolder.sortedChildren$.value.find(
          node => node.name$.value === 'First Folder'
        );

      if (demoFolder) {
        demoFolder.rename('Bridge Folder');
      }
    };

    renameStarterDocs().catch(console.error);
    renameStarterFolder();

    const docsSub = docsService.list.docs$.subscribe(() => {
      renameStarterDocs().catch(console.error);
    });
    const foldersSub =
      organizeService.folderTree.rootFolder.sortedChildren$.subscribe(() => {
        renameStarterFolder();
      });

    return () => {
      docsSub.unsubscribe();
      foldersSub.unsubscribe();
    };
  }, [currentWorkspace, currentWorkspaceName]);

  return (
    <SWRConfigProvider>
      <WorkspaceDialogs />

      {/* ---- some side-effect components ---- */}
      {currentWorkspace?.flavour !== 'local' ? (
        <QuotaCheck workspaceMeta={currentWorkspace.meta} />
      ) : null}
      <AiLoginRequiredModal />
      <WorkspaceSideEffects />
      <PeekViewManagerModal />
      <DocumentTitle />

      <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
      {/* should show after workspace loaded */}
      {/* FIXME: wait for better ai, <WorkspaceAIOnboarding /> */}
      <AIIsland />
      <BridgeFlowAssistant />
      <uniReactRoot.Root />
    </SWRConfigProvider>
  );
};

/**
 * Wraps the workspace layout main router view
 */
const WorkspaceLayoutUIContainer = ({ children }: PropsWithChildren) => {
  const workbench = useService(WorkbenchService).workbench;
  const currentPath = useLiveData(
    LiveData.computed(get => {
      return get(workbench.basename$) + get(workbench.location$).pathname;
    })
  );
  useResponsiveSidebar();

  return (
    <AppContainer data-current-path={currentPath}>{children}</AppContainer>
  );
};
const WorkspaceLayoutInner = ({ children }: PropsWithChildren) => {
  return <WorkspaceLayoutUIContainer>{children}</WorkspaceLayoutUIContainer>;
};
