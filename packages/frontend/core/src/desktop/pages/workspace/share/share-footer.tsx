import { BRAND_SITE_URL } from '@bridgeflow/component/brand';
import { useI18n } from '@bridgeflow/i18n';
import { ArrowRightBigIcon } from '@blocksuite/icons/rc';

import * as styles from './share-footer.css';

export const ShareFooter = () => {
  const t = useI18n();
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footer}>
        <div className={styles.description}>
          {t['com.bridgeflow.share-page.footer.description']()}
        </div>
        <a
          className={styles.getStartLink}
          href={BRAND_SITE_URL}
          target="_blank"
          rel="noreferrer"
        >
          {t['com.bridgeflow.share-page.footer.get-started']()}
          <ArrowRightBigIcon fontSize={16} />
        </a>
      </div>
    </div>
  );
};
