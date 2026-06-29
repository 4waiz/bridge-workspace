import { MenuLinkItem } from '@bridgeflow/core/modules/app-sidebar/views';
import { DocDisplayMetaService } from '@bridgeflow/core/modules/doc-display-meta';
import { JournalService } from '@bridgeflow/core/modules/journal';
import { WorkbenchService } from '@bridgeflow/core/modules/workbench';
import { useI18n } from '@bridgeflow/i18n';
import { TodayIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@kanban-studios/infra';

export const AppSidebarJournalButton = () => {
  const t = useI18n();
  const docDisplayMetaService = useService(DocDisplayMetaService);
  const journalService = useService(JournalService);
  const workbench = useService(WorkbenchService).workbench;
  const location = useLiveData(workbench.location$);
  const maybeDocId = location.pathname.split('/')[1];
  const isJournal = !!useLiveData(journalService.journalDate$(maybeDocId));

  const JournalIcon = useLiveData(docDisplayMetaService.icon$(maybeDocId));
  const Icon = isJournal ? JournalIcon : TodayIcon;

  return (
    <MenuLinkItem
      data-testid="slider-bar-journals-button"
      active={isJournal || location.pathname.startsWith('/journals')}
      to={'/journals'}
      icon={<Icon />}
    >
      {t['com.bridgeflow.journal.app-sidebar-title']()}
    </MenuLinkItem>
  );
};
