import {
  BrandLogo,
  BRAND_SITE_URL,
} from '@bridgeflow/component/brand';
import { Button } from '@bridgeflow/component/ui/button';
import { WorkspaceDialogService } from '@bridgeflow/core/modules/dialogs';
import { appIconMap, appNames } from '@bridgeflow/core/utils/channel';
import { Trans, useI18n } from '@bridgeflow/i18n';
import { LocalWorkspaceIcon } from '@blocksuite/icons/rc';
import { useServiceOptional } from '@kanban-studios/infra';
import type { MouseEvent } from 'react';
import { useCallback } from 'react';

import { getOpenUrlInDesktopAppLink } from '../utils';
import * as styles from './open-in-app-page.css';

let lastOpened = '';

interface OpenAppProps {
  urlToOpen?: string | null;
  openHereClicked?: (e: MouseEvent) => void;
  mode?: 'auth' | 'open-doc'; // default to 'auth'
}
const channel = BUILD_CONFIG.appBuildType;
const url = BUILD_CONFIG.downloadUrl || BRAND_SITE_URL;

export const OpenInAppPage = ({
  urlToOpen,
  openHereClicked,
  mode = 'auth',
}: OpenAppProps) => {
  // default to open the current page in desktop app
  urlToOpen ??= getOpenUrlInDesktopAppLink(window.location.href, true);
  const workspaceDialogService = useServiceOptional(WorkspaceDialogService);
  const t = useI18n();

  const openDownloadLink = useCallback(() => {
    open(url, '_blank');
  }, []);

  const appIcon = appIconMap[channel];
  const appName = appNames[channel];

  const goToAppearanceSetting = useCallback(
    (e: MouseEvent) => {
      openHereClicked?.(e);
      workspaceDialogService?.open('setting', {
        activeTab: 'appearance',
      });
    },
    [workspaceDialogService, openHereClicked]
  );

  if (urlToOpen && lastOpened !== urlToOpen) {
    lastOpened = urlToOpen;
    location.href = urlToOpen;
  }

  if (!urlToOpen) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.topNav}>
        <a href="/" rel="noreferrer" className={styles.bridgeflowLogo}>
          <BrandLogo height={24} />
        </a>

        <div className={styles.topNavLinks}>
          <a
            href={BRAND_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.topNavLink}
          >
            Official Website
          </a>
          <a
            href={BRAND_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.topNavLink}
          >
            Blog
          </a>
          <a
            href={BRAND_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.topNavLink}
          >
            Contact us
          </a>
        </div>

        <Button onClick={openDownloadLink}>
          {t['com.bridgeflow.auth.open.bridgeflow.download-app']()}
        </Button>
      </div>

      <div className={styles.centerContent}>
        <img src={appIcon} alt={appName} width={120} height={120} />

        <div className={styles.prompt}>
          {mode === 'open-doc' ? (
            <Trans i18nKey="com.bridgeflow.auth.open.bridgeflow.open-doc-prompt">
              This doc is now opened in {appName}
            </Trans>
          ) : (
            <Trans i18nKey="com.bridgeflow.auth.open.bridgeflow.prompt">
              Open {appName} app now
            </Trans>
          )}
        </div>

        <div className={styles.promptLinks}>
          {openHereClicked && (
            <a
              className={styles.promptLink}
              onClick={openHereClicked}
              target="_blank"
              rel="noreferrer"
            >
              {t['com.bridgeflow.auth.open.bridgeflow.doc.open-here']()}
            </a>
          )}
          <a
            className={styles.promptLink}
            href={urlToOpen}
            target="_blank"
            rel="noreferrer"
          >
            {t['com.bridgeflow.auth.open.bridgeflow.try-again']()}
          </a>
        </div>
      </div>

      {mode === 'open-doc' ? (
        <div className={styles.docFooter}>
          <button
            className={styles.editSettingsLink}
            onClick={goToAppearanceSetting}
          >
            {t['com.bridgeflow.auth.open.bridgeflow.doc.edit-settings']()}
          </button>

          <div className={styles.docFooterText}>
            <LocalWorkspaceIcon width={16} height={16} />
            {t['com.bridgeflow.auth.open.bridgeflow.doc.footer-text']()}
          </div>
        </div>
      ) : null}
    </div>
  );
};
