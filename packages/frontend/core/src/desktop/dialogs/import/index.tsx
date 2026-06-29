import { Button, IconButton, IconType, Modal } from '@bridgeflow/component';
import { getStoreManager } from '@bridgeflow/core/blocksuite/manager/store';
import { useAsyncCallback } from '@bridgeflow/core/components/hooks/bridgeflow-async-hooks';
import { useNavigateHelper } from '@bridgeflow/core/components/hooks/use-navigate-helper';
import {
  type DialogComponentProps,
  GlobalDialogService,
  type WORKSPACE_DIALOG_SCHEMA,
} from '@bridgeflow/core/modules/dialogs';
import { ExplorerIconService } from '@bridgeflow/core/modules/explorer-icon/services/explorer-icon';
import { OrganizeService } from '@bridgeflow/core/modules/organize';
import { UrlService } from '@bridgeflow/core/modules/url';
import {
  getBridgeFlowWorkspaceSchema,
  type WorkspaceMetadata,
  WorkspaceService,
} from '@bridgeflow/core/modules/workspace';
import { DebugLogger } from '@bridgeflow/debug';
import { useI18n } from '@bridgeflow/i18n';
import track from '@bridgeflow/track';
import { openFilesWith } from '@blocksuite/bridgeflow/shared/utils';
import type { Workspace } from '@blocksuite/bridgeflow/store';
import {
  DocxTransformer,
  HtmlTransformer,
  MarkdownTransformer,
  NotionHtmlTransformer,
  ZipTransformer,
} from '@blocksuite/bridgeflow/widgets/linked-doc';
import {
  ExportToHtmlIcon,
  ExportToMarkdownIcon,
  FileIcon,
  HelpIcon,
  NotionIcon,
  PageIcon,
  SaveIcon,
  ZipIcon,
} from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import {
  type ReactElement,
  type SVGAttributes,
  useCallback,
  useMemo,
  useState,
} from 'react';

import * as style from './styles.css';

const logger = new DebugLogger('import');

type NotionPageIcon = {
  type: 'emoji' | 'image';
  content: string; // emoji unicode or image URL/data
};

type FolderHierarchy = {
  name: string;
  path: string;
  children: Map<string, FolderHierarchy>;
  pageId?: string;
  parentPath?: string;
  icon?: NotionPageIcon;
};

// Helper function to create folder structure using OrganizeService
function createFolderStructure(
  organizeService: OrganizeService,
  hierarchy: FolderHierarchy,
  parentFolderId: string | null = null,
  explorerIconService?: ExplorerIconService
): {
  folderId: string | null;
  docLinks: Array<{ folderId: string; docId: string }>;
} {
  const docLinks: Array<{ folderId: string; docId: string }> = [];
  const rootFolder = organizeService.folderTree.rootFolder;

  function processHierarchyNode(
    node: FolderHierarchy,
    currentParentId: string | null
  ): string | null {
    let currentFolderId = currentParentId;

    // If this node represents a folder (has children but no pageId), create it
    if (node.children.size > 0 && !node.pageId && node.name) {
      const parent = currentParentId
        ? organizeService.folderTree.folderNode$(currentParentId).value
        : rootFolder;

      if (parent) {
        const index = parent.indexAt('after');
        currentFolderId = parent.createFolder(node.name, index);
      }
    }

    // Process all children
    for (const child of node.children.values()) {
      if (child.pageId) {
        // This is a document, link it to the current folder
        if (currentFolderId) {
          docLinks.push({ folderId: currentFolderId, docId: child.pageId });
        }

        // Set icon for the document if available
        if (child.icon && explorerIconService) {
          logger.debug('=== Setting icon for document ===');
          logger.debug('Document ID:', child.pageId);
          logger.debug('Icon data:', child.icon);

          try {
            let iconData;
            if (child.icon.type === 'emoji') {
              iconData = {
                type: IconType.Emoji as const,
                unicode: child.icon.content,
              };
              logger.debug('Created emoji icon data:', iconData);
            } else if (child.icon.type === 'image') {
              // For image icons, we'd need to handle blob conversion
              // For now, let's skip image icons or convert them to default
              // This could be enhanced later to download and convert images to blobs
              logger.debug(
                'Skipping image icon (not implemented):',
                child.icon.content
              );
              iconData = undefined;
            }

            if (iconData) {
              logger.debug('Calling explorerIconService.setIcon with:', {
                where: 'doc',
                id: child.pageId,
                icon: iconData,
              });
              explorerIconService.setIcon({
                where: 'doc',
                id: child.pageId,
                icon: iconData,
              });
              logger.debug('Icon set successfully for document:', child.pageId);
            } else {
              logger.debug('No valid icon data to set');
            }
          } catch (error) {
            logger.error(
              'Error setting icon for document:',
              child.pageId,
              error
            );
            logger.warn(
              'Failed to set icon for document:',
              child.pageId,
              error
            );
          }
        } else {
          if (!child.icon) {
            logger.debug('No icon found for document:', child.pageId);
          }
          if (!explorerIconService) {
            logger.debug(
              'ExplorerIconService not available for document:',
              child.pageId
            );
          }
        }
      } else if (child.children.size > 0) {
        // This is a subfolder, process it recursively
        processHierarchyNode(child, currentFolderId);
      }
    }

    return currentFolderId;
  }

  const rootFolderId = processHierarchyNode(hierarchy, parentFolderId);
  return { folderId: rootFolderId, docLinks };
}

type ImportType =
  | 'markdown'
  | 'markdownZip'
  | 'notion'
  | 'snapshot'
  | 'html'
  | 'docx'
  | 'dotbridgeflowfile';
type AcceptType = 'Markdown' | 'Zip' | 'Html' | 'Docx' | 'Skip'; // Skip is used for dotbridgeflowfile
type Status = 'idle' | 'importing' | 'success' | 'error';
type ImportResult = {
  docIds: string[];
  entryId?: string;
  isWorkspaceFile?: boolean;
  rootFolderId?: string;
};

type ImportConfig = {
  fileOptions: { acceptType: AcceptType; multiple: boolean };
  importFunction: (
    docCollection: Workspace,
    files: File[],
    handleImportBridgeFlowFile: () => Promise<WorkspaceMetadata | undefined>,
    organizeService?: OrganizeService,
    explorerIconService?: ExplorerIconService
  ) => Promise<ImportResult>;
};

const importOptions = [
  {
    key: 'markdown',
    label: 'com.bridgeflow.import.markdown-files',
    prefixIcon: (
      <ExportToMarkdownIcon
        color={cssVarV2('icon/primary')}
        width={20}
        height={20}
      />
    ),
    testId: 'editor-option-menu-import-markdown-files',
    type: 'markdown' as ImportType,
  },
  {
    key: 'markdownZip',
    label: 'com.bridgeflow.import.markdown-with-media-files',
    prefixIcon: (
      <ZipIcon color={cssVarV2('icon/primary')} width={20} height={20} />
    ),
    suffixIcon: (
      <HelpIcon color={cssVarV2('icon/primary')} width={20} height={20} />
    ),
    suffixTooltip: 'com.bridgeflow.import.markdown-with-media-files.tooltip',
    testId: 'editor-option-menu-import-markdown-with-media',
    type: 'markdownZip' as ImportType,
  },
  {
    key: 'html',
    label: 'com.bridgeflow.import.html-files',
    prefixIcon: (
      <ExportToHtmlIcon
        color={cssVarV2('icon/primary')}
        width={20}
        height={20}
      />
    ),
    suffixIcon: (
      <HelpIcon color={cssVarV2('icon/primary')} width={20} height={20} />
    ),
    suffixTooltip: 'com.bridgeflow.import.html-files.tooltip',
    testId: 'editor-option-menu-import-html',
    type: 'html' as ImportType,
  },
  {
    key: 'notion',
    label: 'com.bridgeflow.import.notion',
    prefixIcon: <NotionIcon color={cssVar('black')} width={20} height={20} />,
    suffixIcon: (
      <HelpIcon color={cssVarV2('icon/primary')} width={20} height={20} />
    ),
    suffixTooltip: 'com.bridgeflow.import.notion.tooltip',
    testId: 'editor-option-menu-import-notion',
    type: 'notion' as ImportType,
  },
  {
    key: 'docx',
    label: 'com.bridgeflow.import.docx',
    prefixIcon: <FileIcon color={cssVar('black')} width={20} height={20} />,
    suffixIcon: (
      <HelpIcon color={cssVarV2('icon/primary')} width={20} height={20} />
    ),
    suffixTooltip: 'com.bridgeflow.import.docx.tooltip',
    testId: 'editor-option-menu-import-docx',
    type: 'docx' as ImportType,
  },
  {
    key: 'snapshot',
    label: 'com.bridgeflow.import.snapshot',
    prefixIcon: (
      <PageIcon color={cssVarV2('icon/primary')} width={20} height={20} />
    ),
    suffixIcon: (
      <HelpIcon color={cssVarV2('icon/primary')} width={20} height={20} />
    ),
    suffixTooltip: 'com.bridgeflow.import.snapshot.tooltip',
    testId: 'editor-option-menu-import-snapshot',
    type: 'snapshot' as ImportType,
  },
  BUILD_CONFIG.isElectron
    ? {
        key: 'dotbridgeflowfile',
        label: 'com.bridgeflow.import.dotbridgeflowfile',
        prefixIcon: (
          <SaveIcon color={cssVarV2('icon/primary')} width={20} height={20} />
        ),
        suffixIcon: (
          <HelpIcon color={cssVarV2('icon/primary')} width={20} height={20} />
        ),
        suffixTooltip: 'com.bridgeflow.import.dotbridgeflowfile.tooltip',
        testId: 'editor-option-menu-import-dotbridgeflowfile',
        type: 'dotbridgeflowfile' as ImportType,
      }
    : null,
].filter(v => v !== null);

const importConfigs: Record<ImportType, ImportConfig> = {
  markdown: {
    fileOptions: { acceptType: 'Markdown', multiple: true },
    importFunction: async (
      docCollection,
      files,
      _handleImportBridgeFlowFile,
      _organizeService,
      _explorerIconService
    ) => {
      const docIds: string[] = [];
      for (const file of files) {
        const text = await file.text();
        const fileName = file.name.split('.').slice(0, -1).join('.');
        const docId = await MarkdownTransformer.importMarkdownToDoc({
          collection: docCollection,
          schema: getBridgeFlowWorkspaceSchema(),
          markdown: text,
          fileName,
          extensions: getStoreManager().config.init().value.get('store'),
        });
        if (docId) docIds.push(docId);
      }
      return {
        docIds,
      };
    },
  },
  markdownZip: {
    fileOptions: { acceptType: 'Zip', multiple: false },
    importFunction: async (
      docCollection,
      files,
      _handleImportBridgeFlowFile,
      _organizeService,
      _explorerIconService
    ) => {
      const file = files.length === 1 ? files[0] : null;
      if (!file) {
        throw new Error('Expected a single zip file for markdownZip import');
      }
      const docIds = await MarkdownTransformer.importMarkdownZip({
        collection: docCollection,
        schema: getBridgeFlowWorkspaceSchema(),
        imported: file,
        extensions: getStoreManager().config.init().value.get('store'),
      });
      return {
        docIds,
      };
    },
  },
  html: {
    fileOptions: { acceptType: 'Html', multiple: true },
    importFunction: async (
      docCollection,
      files,
      _handleImportBridgeFlowFile,
      _organizeService,
      _explorerIconService
    ) => {
      const docIds: string[] = [];
      for (const file of files) {
        const text = await file.text();
        const fileName = file.name.split('.').slice(0, -1).join('.');
        const docId = await HtmlTransformer.importHTMLToDoc({
          collection: docCollection,
          schema: getBridgeFlowWorkspaceSchema(),
          extensions: getStoreManager().config.init().value.get('store'),
          html: text,
          fileName,
        });
        if (docId) docIds.push(docId);
      }
      return {
        docIds,
      };
    },
  },
  notion: {
    fileOptions: { acceptType: 'Zip', multiple: false },
    importFunction: async (
      docCollection,
      files,
      _handleImportBridgeFlowFile,
      organizeService,
      explorerIconService
    ) => {
      const file = files.length === 1 ? files[0] : null;
      if (!file) {
        throw new Error('Expected a single zip file for notion import');
      }
      const { entryId, pageIds, isWorkspaceFile, folderHierarchy } =
        await NotionHtmlTransformer.importNotionZip({
          collection: docCollection,
          schema: getBridgeFlowWorkspaceSchema(),
          imported: file,
          extensions: getStoreManager().config.init().value.get('store'),
        });

      let rootFolderId: string | undefined;

      // Create folder structure if hierarchy exists and OrganizeService is available
      if (
        folderHierarchy &&
        organizeService &&
        folderHierarchy.children.size > 0
      ) {
        try {
          const { folderId, docLinks } = createFolderStructure(
            organizeService,
            folderHierarchy,
            null,
            explorerIconService
          );
          rootFolderId = folderId || undefined;

          // Create links for all documents to their respective folders
          for (const { folderId, docId } of docLinks) {
            const folder =
              organizeService.folderTree.folderNode$(folderId).value;
            if (folder) {
              const index = folder.indexAt('after');
              folder.createLink('doc', docId, index);
            }
          }
        } catch (error) {
          logger.warn('Failed to create folder structure:', error);
          // Continue with import even if folder creation fails
        }
      }

      return {
        docIds: pageIds,
        entryId,
        isWorkspaceFile,
        rootFolderId,
      };
    },
  },
  docx: {
    fileOptions: { acceptType: 'Docx', multiple: false },
    importFunction: async (docCollection, file) => {
      const files = Array.isArray(file) ? file : [file];
      const docIds: string[] = [];
      for (const file of files) {
        const docId = await DocxTransformer.importDocx({
          collection: docCollection,
          schema: getBridgeFlowWorkspaceSchema(),
          imported: file,
          extensions: getStoreManager().config.init().value.get('store'),
        });
        if (docId) docIds.push(docId);
      }
      return { docIds };
    },
  },
  snapshot: {
    fileOptions: { acceptType: 'Zip', multiple: false },
    importFunction: async (
      docCollection,
      files,
      _handleImportBridgeFlowFile,
      _organizeService,
      _explorerIconService
    ) => {
      const file = files.length === 1 ? files[0] : null;
      if (!file) {
        throw new Error('Expected a single zip file for snapshot import');
      }
      const docIds = (
        await ZipTransformer.importDocs(
          docCollection,
          getBridgeFlowWorkspaceSchema(),
          file
        )
      )
        .filter(doc => doc !== undefined)
        .map(doc => doc.id);

      return {
        docIds,
      };
    },
  },
  dotbridgeflowfile: {
    fileOptions: { acceptType: 'Skip', multiple: false },
    importFunction: async (
      _,
      __,
      handleImportBridgeFlowFile,
      _organizeService,
      _explorerIconService
    ) => {
      await handleImportBridgeFlowFile();
      return {
        docIds: [],
        entryId: undefined,
        isWorkspaceFile: true,
      };
    },
  },
};

const ImportOptionItem = ({
  label,
  prefixIcon,
  suffixIcon,
  suffixTooltip,
  type,
  onImport,
  ...props
}: {
  label: string;
  prefixIcon: ReactElement<SVGAttributes<SVGElement>>;
  suffixIcon?: ReactElement<SVGAttributes<SVGElement>>;
  suffixTooltip?: string;
  type: ImportType;
  onImport: (type: ImportType) => void;
}) => {
  const t = useI18n();
  return (
    <div className={style.importItem} onClick={() => onImport(type)} {...props}>
      {prefixIcon}
      <div className={style.importItemLabel}>{t[label]()}</div>
      {suffixIcon && (
        <IconButton
          className={style.importItemSuffix}
          icon={suffixIcon}
          tooltip={suffixTooltip ? t[suffixTooltip]() : undefined}
        />
      )}
    </div>
  );
};

const ImportOptions = ({
  onImport,
}: {
  onImport: (type: ImportType) => void;
}) => {
  const t = useI18n();

  return (
    <>
      <div className={style.importModalTitle}>{t['Import']()}</div>
      <div className={style.importModalContent}>
        {importOptions.map(
          ({
            key,
            label,
            prefixIcon,
            suffixIcon,
            suffixTooltip,
            testId,
            type,
          }) => (
            <ImportOptionItem
              key={key}
              prefixIcon={prefixIcon}
              suffixIcon={suffixIcon}
              suffixTooltip={suffixTooltip}
              label={label}
              type={type}
              onImport={onImport}
              data-testid={testId}
            />
          )
        )}
      </div>
      <div className={style.importModalTip}>
        {t['com.bridgeflow.import.modal.tip']()}{' '}
        <a
          className={style.link}
          href={BUILD_CONFIG.discordUrl}
          target="_blank"
          rel="noreferrer"
        >
          Discord
        </a>
        .
      </div>
    </>
  );
};

const ImportingStatus = () => {
  const t = useI18n();
  return (
    <>
      <div className={style.importModalTitle}>
        {t['com.bridgeflow.import.status.importing.title']()}
      </div>
      <p className={style.importStatusContent}>
        {t['com.bridgeflow.import.status.importing.message']()}
      </p>
    </>
  );
};

const SuccessStatus = ({ onComplete }: { onComplete: () => void }) => {
  const t = useI18n();
  return (
    <>
      <div className={style.importModalTitle}>
        {t['com.bridgeflow.import.status.success.title']()}
      </div>
      <p className={style.importStatusContent}>
        {t['com.bridgeflow.import.status.success.message']()}{' '}
        <a
          className={style.link}
          href={BUILD_CONFIG.discordUrl}
          target="_blank"
          rel="noreferrer"
        >
          Discord
        </a>
        .
      </p>
      <div className={style.importModalButtonContainer}>
        <Button onClick={onComplete} variant="primary">
          {t['Complete']()}
        </Button>
      </div>
    </>
  );
};

const ErrorStatus = ({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) => {
  const t = useI18n();
  const urlService = useService(UrlService);
  return (
    <>
      <div className={style.importModalTitle}>
        {t['com.bridgeflow.import.status.failed.title']()}
      </div>
      <p className={style.importStatusContent}>
        {error || 'Unknown error occurred'}
      </p>
      <div className={style.importModalButtonContainer}>
        <Button
          onClick={() => {
            urlService.openPopupWindow(BUILD_CONFIG.discordUrl);
          }}
          variant="secondary"
        >
          {t['Feedback']()}
        </Button>
        <Button onClick={onRetry} variant="primary">
          {t['Retry']()}
        </Button>
      </div>
    </>
  );
};

export const ImportDialog = ({
  close,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['import']>) => {
  const t = useI18n();
  const [status, setStatus] = useState<Status>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const workspace = useService(WorkspaceService).workspace;
  const docCollection = workspace.docCollection;
  const organizeService = useService(OrganizeService);
  const explorerIconService = useService(ExplorerIconService);

  const globalDialogService = useService(GlobalDialogService);

  const { jumpToPage } = useNavigateHelper();
  const handleCreatedWorkspace = useCallback(
    (payload: { metadata: WorkspaceMetadata; defaultDocId?: string }) => {
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          if (payload.defaultDocId) {
            jumpToPage(payload.metadata.id, payload.defaultDocId);
          } else {
            jumpToPage(payload.metadata.id, 'all');
          }
          return new Promise(resolve =>
            setTimeout(resolve, 150)
          ); /* start transition after 150ms */
        });
      } else {
        if (payload.defaultDocId) {
          jumpToPage(payload.metadata.id, payload.defaultDocId);
        } else {
          jumpToPage(payload.metadata.id, 'all');
        }
      }
    },
    [jumpToPage]
  );

  const handleImportBridgeFlowFile = useMemo(() => {
    return async () => {
      track.$.navigationPanel.workspaceList.createWorkspace({
        control: 'import',
      });

      return new Promise<WorkspaceMetadata | undefined>((resolve, reject) => {
        globalDialogService.open('import-workspace', undefined, payload => {
          if (payload) {
            handleCreatedWorkspace({ metadata: payload.workspace });
            resolve(payload.workspace);
          } else {
            reject(new Error('No workspace imported'));
          }
        });
      });
    };
  }, [globalDialogService, handleCreatedWorkspace]);

  const handleImport = useAsyncCallback(
    async (type: ImportType) => {
      setImportError(null);
      try {
        const importConfig = importConfigs[type];
        const { acceptType, multiple } = importConfig.fileOptions;

        const files =
          acceptType === 'Skip'
            ? []
            : await openFilesWith(acceptType, multiple);

        if (!files || (files.length === 0 && acceptType !== 'Skip')) {
          throw new Error(
            t['com.bridgeflow.import.status.failed.message.no-file-selected']()
          );
        }

        if (acceptType !== 'Skip') {
          setStatus('importing');
          track.$.importModal.$.import({
            type,
            status: 'importing',
          });
        }

        const { docIds, entryId, isWorkspaceFile, rootFolderId } =
          await importConfig.importFunction(
            docCollection,
            files,
            handleImportBridgeFlowFile,
            organizeService,
            explorerIconService
          );

        setImportResult({ docIds, entryId, isWorkspaceFile, rootFolderId });
        setStatus('success');
        track.$.importModal.$.import({
          type,
          status: 'success',
          result: {
            docCount: docIds.length,
          },
        });
        track.$.importModal.$.createDoc({
          control: 'import',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        setImportError(errorMessage);
        setStatus('error');
        track.$.importModal.$.import({
          type,
          status: 'failed',
          error: errorMessage || undefined,
        });
        logger.error('Failed to import', error);
      }
    },
    [
      docCollection,
      explorerIconService,
      handleImportBridgeFlowFile,
      organizeService,
      t,
    ]
  );

  const handleComplete = useCallback(() => {
    close(importResult || undefined);
  }, [importResult, close]);

  const handleRetry = () => {
    setStatus('idle');
  };

  const statusComponents = {
    idle: <ImportOptions onImport={handleImport} />,
    importing: <ImportingStatus />,
    success: <SuccessStatus onComplete={handleComplete} />,
    error: <ErrorStatus error={importError} onRetry={handleRetry} />,
  };

  return (
    <Modal
      open
      onOpenChange={(open: boolean) => {
        if (!open) {
          close(importResult || undefined);
        }
      }}
      width={480}
      contentOptions={{
        ['data-testid' as string]: 'import-modal',
        style: {
          maxHeight: '85vh',
          maxWidth: '70vw',
          minHeight: '126px',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          background: cssVarV2('layer/background/primary'),
        },
      }}
      closeButtonOptions={{
        className: style.closeButton,
      }}
      withoutCloseButton={status === 'importing'}
      persistent={status === 'importing'}
    >
      <div className={style.importModalContainer} data-testid="import-dialog">
        {statusComponents[status]}
      </div>
    </Modal>
  );
};
