import { AppSidebarService } from '@bridgeflow/core/modules/app-sidebar';
import { DesktopApiService } from '@bridgeflow/core/modules/desktop-api';
import {
  GlobalDialogService,
  WorkspaceDialogService,
} from '@bridgeflow/core/modules/dialogs';
import { I18nService } from '@bridgeflow/core/modules/i18n';
import { UrlService } from '@bridgeflow/core/modules/url';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { WorkspaceService } from '@bridgeflow/core/modules/workspace';
import { useI18n } from '@bridgeflow/i18n';
import {
  useService,
  useServiceOptional,
  useServices,
} from '@toeverything/infra';
import { useStore } from 'jotai';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

import { usePageHelper } from '../../blocksuite/block-suite-page-list/utils';
import {
  PreconditionStrategy,
  registerBridgeFlowCommand,
  registerBridgeFlowCreationCommands,
  registerBridgeFlowHelpCommands,
  registerBridgeFlowLanguageCommands,
  registerBridgeFlowLayoutCommands,
  registerBridgeFlowNavigationCommands,
  registerBridgeFlowSettingsCommands,
  registerBridgeFlowUpdatesCommands,
} from '../../commands';
import { EditorSettingService } from '../../modules/editor-setting';
import { CMDKQuickSearchService } from '../../modules/quicksearch/services/cmdk';
import { useNavigateHelper } from './use-navigate-helper';

function registerCMDKCommand(service: CMDKQuickSearchService) {
  return registerBridgeFlowCommand({
    id: 'bridgeflow:show-quick-search',
    preconditionStrategy: PreconditionStrategy.Never,
    category: 'bridgeflow:general',
    keyBinding: {
      binding: '$mod+K',
    },
    label: '',
    icon: '',
    run() {
      service.toggle();
    },
  });
}

export function useRegisterWorkspaceCommands() {
  const store = useStore();
  const t = useI18n();
  const theme = useTheme();
  const currentWorkspace = useService(WorkspaceService).workspace;
  const urlService = useService(UrlService);
  const pageHelper = usePageHelper(currentWorkspace.docCollection);
  const navigationHelper = useNavigateHelper();
  const {
    cMDKQuickSearchService,
    editorSettingService,
    workspaceDialogService,
    globalDialogService,
    appSidebarService,
    i18nService,
  } = useServices({
    CMDKQuickSearchService,
    EditorSettingService,
    WorkspaceDialogService,
    GlobalDialogService,
    AppSidebarService,
    I18nService,
  });

  const i18n = i18nService.i18n;

  const desktopApiService = useServiceOptional(DesktopApiService);
  const workbenchService = useServiceOptional(WorkbenchService);

  const quitAndInstall = desktopApiService?.handler.updater.quitAndInstall;

  useEffect(() => {
    const unsub = registerCMDKCommand(cMDKQuickSearchService);

    return () => {
      unsub();
    };
  }, [cMDKQuickSearchService]);

  // register BridgeFlowUpdatesCommands
  useEffect(() => {
    if (!quitAndInstall) {
      return;
    }

    const unsub = registerBridgeFlowUpdatesCommands({
      store,
      t,
      quitAndInstall,
    });

    return () => {
      unsub();
    };
  }, [quitAndInstall, store, t]);

  // register BridgeFlowNavigationCommands
  useEffect(() => {
    const unsub = registerBridgeFlowNavigationCommands({
      t,
      docCollection: currentWorkspace.docCollection,
      navigationHelper,
      workspaceDialogService,
      workbenchService,
    });

    return () => {
      unsub();
    };
  }, [
    store,
    t,
    currentWorkspace.docCollection,
    navigationHelper,
    globalDialogService,
    workspaceDialogService,
    workbenchService,
  ]);

  // register BridgeFlowSettingsCommands
  useEffect(() => {
    const unsub = registerBridgeFlowSettingsCommands({
      store,
      t,
      theme,
      editorSettingService,
    });

    return () => {
      unsub();
    };
  }, [editorSettingService, store, t, theme]);

  useEffect(() => {
    const unsub = registerBridgeFlowLanguageCommands({
      i18n,
      t,
    });

    return () => {
      unsub();
    };
  }, [i18n, t]);

  // register BridgeFlowLayoutCommands
  useEffect(() => {
    const unsub = registerBridgeFlowLayoutCommands({ t, appSidebarService });

    return () => {
      unsub();
    };
  }, [appSidebarService, store, t]);

  // register BridgeFlowCreationCommands
  useEffect(() => {
    const unsub = registerBridgeFlowCreationCommands({
      globalDialogService,
      pageHelper: pageHelper,
      t,
    });

    return () => {
      unsub();
    };
  }, [store, pageHelper, t, globalDialogService]);

  // register BridgeFlowHelpCommands
  useEffect(() => {
    const unsub = registerBridgeFlowHelpCommands({
      t,
      urlService,
      workspaceDialogService,
    });

    return () => {
      unsub();
    };
  }, [t, globalDialogService, urlService, workspaceDialogService]);
}
