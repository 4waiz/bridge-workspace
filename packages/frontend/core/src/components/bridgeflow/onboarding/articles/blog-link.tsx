import { BRAND_SITE_URL } from '@bridgeflow/component/brand';

import { link } from './blocks.css';

export const BlogLink = () => {
  return (
    <a className={link} href={BRAND_SITE_URL}>
      Check other articles
    </a>
  );
};
