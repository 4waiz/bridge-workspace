import { BRAND_SITE_URL } from '@affine/component/brand';
import { useI18n } from '@affine/i18n';
import { useMemo } from 'react';

export const useNavConfig = () => {
  const t = useI18n();
  return useMemo(
    () => [
      {
        title: t['com.affine.other-page.nav.official-website'](),
        path: BRAND_SITE_URL,
      },
      {
        title: t['com.affine.other-page.nav.blog'](),
        path: BRAND_SITE_URL,
      },
      {
        title: t['com.affine.other-page.nav.contact-us'](),
        path: BRAND_SITE_URL,
      },
    ],
    [t]
  );
};
