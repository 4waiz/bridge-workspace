import { EmptyTags } from '@bridgeflow/core/components/bridgeflow/empty';
import { TagService } from '@bridgeflow/core/modules/tag';
import { useLiveData, useService } from '@kanban-studios/infra';

import { TagItem } from './item';
import { list } from './styles.css';

export const TagList = () => {
  const tagList = useService(TagService).tagList;
  const tags = useLiveData(tagList.tags$);

  if (!tags.length) {
    return <EmptyTags absoluteCenter />;
  }

  return (
    <ul className={list}>
      {tags.map(tag => (
        <TagItem key={tag.id} tag={tag} />
      ))}
    </ul>
  );
};
