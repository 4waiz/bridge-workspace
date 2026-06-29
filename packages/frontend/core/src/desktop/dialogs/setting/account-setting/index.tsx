import { FlexWrapper, Input, notify } from '@bridgeflow/component';
import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@bridgeflow/component/setting-components';
import { Avatar } from '@bridgeflow/component/ui/avatar';
import { Button } from '@bridgeflow/component/ui/button';
import { useSignOut } from '@bridgeflow/core/components/hooks/bridgeflow/use-sign-out';
import { useAsyncCallback } from '@bridgeflow/core/components/hooks/bridgeflow-async-hooks';
import { useCatchEventCallback } from '@bridgeflow/core/components/hooks/use-catch-event-hook';
import { Upload } from '@bridgeflow/core/components/pure/file-upload';
import { GlobalDialogService } from '@bridgeflow/core/modules/dialogs';
import { SubscriptionPlan } from '@bridgeflow/graphql';
import { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { ArrowRightSmallIcon, CameraIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService, useServices } from '@kanban-studios/infra';
import { useCallback, useEffect, useState } from 'react';

import { AuthService, ServerService } from '../../../../modules/cloud';
import type { SettingState } from '../types';
import { AIUsagePanel } from './ai-usage-panel';
import { DeleteAccount } from './delete-account';
import { IntegrationsPanel } from './integrations-panel';
import { StorageProgress } from './storage-progress';
import * as styles from './style.css';

export const UserAvatar = () => {
  const t = useI18n();
  const session = useService(AuthService).session;
  const account = useLiveData(session.account$);

  const handleUpdateUserAvatar = useAsyncCallback(
    async (file: File) => {
      try {
        track.$.settingsPanel.accountSettings.uploadAvatar();
        await session.uploadAvatar(file);
        notify.success({ title: 'Update user avatar success' });
      } catch (e) {
        // TODO(@catsjuice): i18n
        notify.error({
          title: 'Update user avatar failed',
          message: String(e),
        });
      }
    },
    [session]
  );

  const handleRemoveUserAvatar = useCatchEventCallback(async () => {
    track.$.settingsPanel.accountSettings.removeAvatar();
    await session.removeAvatar();
  }, [session]);

  return (
    <Upload
      accept="image/gif,image/jpeg,image/jpg,image/png,image/svg"
      fileChange={handleUpdateUserAvatar}
      data-testid="upload-user-avatar"
    >
      <Avatar
        size={56}
        name={account?.label}
        url={account?.avatar}
        hoverIcon={<CameraIcon />}
        onRemove={account?.avatar ? handleRemoveUserAvatar : undefined}
        avatarTooltipOptions={{ content: t['Click to replace photo']() }}
        removeTooltipOptions={{ content: t['Remove photo']() }}
        data-testid="user-setting-avatar"
        removeButtonProps={{
          ['data-testid' as string]: 'user-setting-remove-avatar-button',
        }}
      />
    </Upload>
  );
};

export const AvatarAndName = () => {
  const t = useI18n();
  const session = useService(AuthService).session;
  const account = useLiveData(session.account$);
  const [input, setInput] = useState<string>(account?.label ?? '');

  const allowUpdate = !!input && input !== account?.label;
  const handleUpdateUserName = useAsyncCallback(async () => {
    if (account === null) {
      return;
    }
    if (!allowUpdate) {
      return;
    }

    try {
      track.$.settingsPanel.accountSettings.updateUserName();
      await session.updateLabel(input);
    } catch (e) {
      notify.error({
        title: 'Failed to update user name.',
        message: String(e),
      });
    }
  }, [account, allowUpdate, session, input]);

  return (
    <SettingRow
      name={t['com.bridgeflow.settings.profile']()}
      desc={t['com.bridgeflow.settings.profile.message']()}
      spreadCol={false}
    >
      <FlexWrapper style={{ margin: '12px 0 24px 0' }} alignItems="center">
        <UserAvatar />

        <div className={styles.profileInputWrapper}>
          <label>{t['com.bridgeflow.settings.profile.name']()}</label>
          <FlexWrapper alignItems="center">
            <Input
              defaultValue={input}
              data-testid="user-name-input"
              placeholder={t['com.bridgeflow.settings.profile.placeholder']()}
              maxLength={64}
              minLength={0}
              style={{ width: 280, height: 32 }}
              onChange={setInput}
              onEnter={handleUpdateUserName}
            />
            {allowUpdate ? (
              <Button
                data-testid="save-user-name"
                onClick={handleUpdateUserName}
                style={{
                  marginLeft: '12px',
                }}
              >
                {t['com.bridgeflow.editCollection.save']()}
              </Button>
            ) : null}
          </FlexWrapper>
        </div>
      </FlexWrapper>
    </SettingRow>
  );
};

const StoragePanel = ({
  onChangeSettingState,
}: {
  onChangeSettingState?: (settingState: SettingState) => void;
}) => {
  const t = useI18n();

  const onUpgrade = useCallback(() => {
    track.$.settingsPanel.accountUsage.viewPlans({
      plan: SubscriptionPlan.Pro,
    });
    onChangeSettingState?.({
      activeTab: 'plans',
      scrollAnchor: 'cloudPricingPlan',
    });
  }, [onChangeSettingState]);

  return (
    <SettingRow
      name={t['com.bridgeflow.storage.title']()}
      desc=""
      spreadCol={false}
    >
      <StorageProgress onUpgrade={onUpgrade} />
    </SettingRow>
  );
};

export const AccountSetting = ({
  onChangeSettingState,
}: {
  onChangeSettingState?: (settingState: SettingState) => void;
}) => {
  const { authService, serverService, globalDialogService } = useServices({
    AuthService,
    ServerService,
    GlobalDialogService,
  });
  const serverFeatures = useLiveData(serverService.server.features$);
  const t = useI18n();
  const session = authService.session;
  useEffect(() => {
    session.revalidate();
  }, [session]);
  const account = useLiveData(session.account$);
  const openSignOutModal = useSignOut();

  const onChangeEmail = useCallback(() => {
    if (!account) {
      return;
    }
    globalDialogService.open('verify-email', {
      server: serverService.server.baseUrl,
      changeEmail: !!account.info?.emailVerified,
    });
  }, [account, globalDialogService, serverService.server.baseUrl]);

  const onPasswordButtonClick = useCallback(() => {
    globalDialogService.open('change-password', {
      server: serverService.server.baseUrl,
    });
  }, [globalDialogService, serverService.server.baseUrl]);

  if (!account) {
    return null;
  }

  return (
    <>
      <SettingHeader
        title={t['com.bridgeflow.setting.account']()}
        subtitle={t['com.bridgeflow.setting.account.message']()}
        data-testid="account-title"
      />
      <AvatarAndName />
      <SettingWrapper>
        <SettingRow
          name={t['com.bridgeflow.settings.email']()}
          desc={account.email}
        >
          <Button onClick={onChangeEmail}>
            {account.info?.emailVerified
              ? t['com.bridgeflow.settings.email.action.change']()
              : t['com.bridgeflow.settings.email.action.verify']()}
          </Button>
        </SettingRow>
        <SettingRow
          name={t['com.bridgeflow.settings.password']()}
          desc={t['com.bridgeflow.settings.password.message']()}
        >
          <Button onClick={onPasswordButtonClick}>
            {account.info?.hasPassword
              ? t['com.bridgeflow.settings.password.action.change']()
              : t['com.bridgeflow.settings.password.action.set']()}
          </Button>
        </SettingRow>
        <StoragePanel onChangeSettingState={onChangeSettingState} />
        {serverFeatures?.copilot && (
          <AIUsagePanel onChangeSettingState={onChangeSettingState} />
        )}
        <IntegrationsPanel />
        <SettingRow
          name={t[`Sign out`]()}
          desc={t['com.bridgeflow.setting.sign.out.message']()}
          style={{ cursor: 'pointer' }}
          data-testid="sign-out-button"
          onClick={openSignOutModal}
        >
          <ArrowRightSmallIcon />
        </SettingRow>
      </SettingWrapper>
      <DeleteAccount />
    </>
  );
};
