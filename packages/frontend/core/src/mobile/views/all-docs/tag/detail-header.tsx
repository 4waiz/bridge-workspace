import { PageHeader } from '@bridgeflow/core/mobile/components';
import type { Tag } from '@bridgeflow/core/modules/tag';
import { useLiveData } from '@kanban-studios/infra';

import * as styles from './detail.css';

export const TagDetailHeader = ({ tag }: { tag: Tag }) => {
  const name = useLiveData(tag.value$);
  const color = useLiveData(tag.color$);
  return (
    <PageHeader className={styles.header} back>
      <div className={styles.headerContent}>
        <div className={styles.headerIcon} style={{ color }} />
        {name}
      </div>
    </PageHeader>
  );
};
