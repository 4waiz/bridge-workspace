import { BRAND_SITE_URL } from '@bridgeflow/component/brand';
import { useI18n } from '@bridgeflow/i18n';

import { SettingGroup } from '../group';
import { RowLayout } from '../row.layout';
import { DeleteAccount } from './delete-account';

export const OthersGroup = () => {
  const t = useI18n();

  return (
    <SettingGroup title={t['com.bridgeflow.mobile.setting.others.title']()}>
      <RowLayout
        label={t['com.bridgeflow.mobile.setting.others.github']()}
        href={BRAND_SITE_URL}
      />

      <RowLayout
        label={t['com.bridgeflow.mobile.setting.others.website']()}
        href={BRAND_SITE_URL}
      />

      <RowLayout
        label={t['com.bridgeflow.mobile.setting.others.privacy']()}
        href={BRAND_SITE_URL}
      />

      <RowLayout
        label={t['com.bridgeflow.mobile.setting.others.terms']()}
        href={BRAND_SITE_URL}
      />
      <DeleteAccount />
    </SettingGroup>
  );
};
