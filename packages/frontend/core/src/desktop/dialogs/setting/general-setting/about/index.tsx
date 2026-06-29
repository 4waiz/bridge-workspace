import {
  BRAND_CREATOR_NAME,
  BRAND_SITE_URL,
} from '@bridgeflow/component/brand';
import { Switch } from '@bridgeflow/component';
import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@bridgeflow/component/setting-components';
import { useAppUpdater } from '@bridgeflow/core/components/hooks/use-app-updater';
import { UrlService } from '@bridgeflow/core/modules/url';
import { appIconMap, appNames } from '@bridgeflow/core/utils/channel';
import { useI18n } from '@bridgeflow/i18n';
import { ArrowRightSmallIcon, OpenInNewIcon } from '@blocksuite/icons/rc';
import { useServices } from '@toeverything/infra';
import { useCallback } from 'react';

import { useAppSettingHelper } from '../../../../../components/hooks/bridgeflow/use-app-setting-helper';
import { relatedLinks } from './config';
import * as styles from './style.css';
import { UpdateCheckSection } from './update-check-section';

export const AboutBridgeFlow = () => {
  const t = useI18n();
  const { appSettings, updateSettings } = useAppSettingHelper();
  const { toggleAutoCheck, toggleAutoDownload } = useAppUpdater();
  const channel = BUILD_CONFIG.appBuildType;
  const appIcon = appIconMap[channel];
  const appName = appNames[channel];
  const { urlService } = useServices({
    UrlService,
  });

  const onSwitchAutoCheck = useCallback(
    (checked: boolean) => {
      toggleAutoCheck(checked);
      updateSettings('autoCheckUpdate', checked);
    },
    [toggleAutoCheck, updateSettings]
  );

  const onSwitchAutoDownload = useCallback(
    (checked: boolean) => {
      toggleAutoDownload(checked);
      updateSettings('autoDownloadUpdate', checked);
    },
    [toggleAutoDownload, updateSettings]
  );

  const onSwitchTelemetry = useCallback(
    (checked: boolean) => {
      updateSettings('enableTelemetry', checked);
    },
    [updateSettings]
  );

  return (
    <>
      <SettingHeader
        title={t['com.bridgeflow.aboutBridgeFlow.title']()}
        subtitle={t['com.bridgeflow.aboutBridgeFlow.subtitle']()}
        data-testid="about-title"
      />
      <SettingWrapper title={t['com.bridgeflow.aboutBridgeFlow.version.title']()}>
        <SettingRow
          name={appName}
          desc={BUILD_CONFIG.appVersion}
          className={styles.appImageRow}
        >
          <img src={appIcon} alt={appName} width={56} height={56} />
        </SettingRow>
        <SettingRow
          name={t['com.bridgeflow.aboutBridgeFlow.version.editor.title']()}
          desc={BUILD_CONFIG.editorVersion}
        />
        {BUILD_CONFIG.isElectron ? (
          <>
            <UpdateCheckSection />
            <SettingRow
              name={t['com.bridgeflow.aboutBridgeFlow.autoCheckUpdate.title']()}
              desc={t['com.bridgeflow.aboutBridgeFlow.autoCheckUpdate.description']()}
            >
              <Switch
                checked={appSettings.autoCheckUpdate}
                onChange={onSwitchAutoCheck}
              />
            </SettingRow>
            <SettingRow
              name={t['com.bridgeflow.aboutBridgeFlow.autoDownloadUpdate.title']()}
              desc={t[
                'com.bridgeflow.aboutBridgeFlow.autoDownloadUpdate.description'
              ]()}
            >
              <Switch
                checked={appSettings.autoDownloadUpdate}
                onChange={onSwitchAutoDownload}
              />
            </SettingRow>
            <SettingRow
              name={t['com.bridgeflow.aboutBridgeFlow.changelog.title']()}
              desc={t['com.bridgeflow.aboutBridgeFlow.changelog.description']()}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                urlService.openPopupWindow(BUILD_CONFIG.changelogUrl);
              }}
            >
              <ArrowRightSmallIcon />
            </SettingRow>
          </>
        ) : null}
        <SettingRow
          name={t['com.bridgeflow.telemetry.enable']()}
          desc={t['com.bridgeflow.telemetry.enable.desc']()}
        >
          <Switch
            checked={appSettings.enableTelemetry !== false}
            onChange={onSwitchTelemetry}
          />
        </SettingRow>
      </SettingWrapper>
      <SettingWrapper title={t['com.bridgeflow.aboutBridgeFlow.contact.title']()}>
        <a
          className={styles.link}
          rel="noreferrer"
          href={BRAND_SITE_URL}
          target="_blank"
        >
          {t['com.bridgeflow.aboutBridgeFlow.contact.website']()}
          <OpenInNewIcon className="icon" />
        </a>
        <a
          className={styles.link}
          rel="noreferrer"
          href={BRAND_SITE_URL}
          target="_blank"
        >
          {BRAND_CREATOR_NAME}
          <OpenInNewIcon className="icon" />
        </a>
        <a
          className={styles.link}
          rel="noreferrer"
          href={BRAND_SITE_URL}
          target="_blank"
        >
          {t['com.bridgeflow.aboutBridgeFlow.contact.community']()}
          <OpenInNewIcon className="icon" />
        </a>
      </SettingWrapper>
      {relatedLinks.length ? (
        <SettingWrapper title={t['com.bridgeflow.aboutBridgeFlow.community.title']()}>
          <div className={styles.communityWrapper}>
            {relatedLinks.map(({ icon, title, link }) => {
              return (
                <div
                  className={styles.communityItem}
                  onClick={() => {
                    urlService.openPopupWindow(link);
                  }}
                  key={title}
                >
                  {icon}
                  <p>{title}</p>
                </div>
              );
            })}
          </div>
        </SettingWrapper>
      ) : null}
      <SettingWrapper title={t['com.bridgeflow.aboutBridgeFlow.legal.title']()}>
        <a
          className={styles.link}
          rel="noreferrer"
          href={BRAND_SITE_URL}
          target="_blank"
        >
          {t['com.bridgeflow.aboutBridgeFlow.legal.privacy']()}
          <OpenInNewIcon className="icon" />
        </a>
        <a
          className={styles.link}
          rel="noreferrer"
          href={BRAND_SITE_URL}
          target="_blank"
        >
          {t['com.bridgeflow.aboutBridgeFlow.legal.tos']()}
          <OpenInNewIcon className="icon" />
        </a>
      </SettingWrapper>
    </>
  );
};
