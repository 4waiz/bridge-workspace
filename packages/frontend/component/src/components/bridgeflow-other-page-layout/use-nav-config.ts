import { BRAND_SITE_URL } from '@bridgeflow/component/brand';
import { useI18n } from '@bridgeflow/i18n';
import { useMemo } from 'react';

export const useNavConfig = () => {
  const t = useI18n();
  return useMemo(
    () => [
      {
        title: t['com.bridgeflow.other-page.nav.official-website'](),
        path: BRAND_SITE_URL,
      },
      {
        title: t['com.bridgeflow.other-page.nav.blog'](),
        path: BRAND_SITE_URL,
      },
      {
        title: t['com.bridgeflow.other-page.nav.contact-us'](),
        path: BRAND_SITE_URL,
      },
    ],
    [t]
  );
};
