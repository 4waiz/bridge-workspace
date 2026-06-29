import {
  Button,
  Divider,
  Menu,
  PropertyCollapsibleContent,
  PropertyCollapsibleSection,
  Scrollable,
} from '@bridgeflow/component';
import { useGuard } from '@bridgeflow/core/components/guard';
import {
  type DefaultOpenProperty,
  WorkspacePropertyRow,
} from '@bridgeflow/core/components/properties';
import { CreatePropertyMenuItems } from '@bridgeflow/core/components/properties/menu/create-doc-property';
import { LinksRow } from '@bridgeflow/core/desktop/dialogs/doc-info/links-row';
import { TimeRow } from '@bridgeflow/core/desktop/dialogs/doc-info/time-row';
import type { DocCustomPropertyInfo } from '@bridgeflow/core/modules/db';
import { DocDatabaseBacklinkInfo } from '@bridgeflow/core/modules/doc-info';
import { DocLinksService } from '@bridgeflow/core/modules/doc-link';
import { WorkspacePropertyService } from '@bridgeflow/core/modules/workspace-property';
import { useI18n } from '@bridgeflow/i18n';
import { PlusIcon } from '@blocksuite/icons/rc';
import { useLiveData, useServices } from '@toeverything/infra';
import { Suspense, useCallback, useEffect, useState } from 'react';

import * as styles from './doc-info.css';

export const DocInfoSheet = ({
  docId,
}: {
  docId: string;
  defaultOpenProperty?: DefaultOpenProperty;
}) => {
  const { workspacePropertyService, docLinksService } = useServices({
    WorkspacePropertyService,
    DocLinksService,
  });
  const t = useI18n();

  const canEditPropertyInfo = useGuard('Workspace_Properties_Update');
  const canEditProperty = useGuard('Doc_Update', docId);
  const links = useLiveData(docLinksService.links.links$);
  const backlinks = useLiveData(docLinksService.backlinks.backlinks$);

  const [newPropertyId, setNewPropertyId] = useState<string | null>(null);

  const onPropertyAdded = useCallback((property: DocCustomPropertyInfo) => {
    setNewPropertyId(property.id);
  }, []);

  useEffect(() => {
    docLinksService.backlinks.revalidateFromCloud();
  }, [docLinksService.backlinks]);

  const properties = useLiveData(workspacePropertyService.sortedProperties$);

  return (
    <Scrollable.Root className={styles.scrollableRoot}>
      <Scrollable.Viewport data-testid="doc-info-menu">
        <Suspense>
          <TimeRow docId={docId} className={styles.timeRow} />
          <Divider size="thinner" />
          <PropertyCollapsibleSection
            title={t.t('com.bridgeflow.workspace.properties')}
          >
            <PropertyCollapsibleContent
              className={styles.tableBodyRoot}
              collapseButtonText={({ hide, isCollapsed }) =>
                isCollapsed
                  ? hide === 1
                    ? t['com.bridgeflow.page-properties.more-property.one']({
                        count: hide.toString(),
                      })
                    : t['com.bridgeflow.page-properties.more-property.more']({
                        count: hide.toString(),
                      })
                  : hide === 1
                    ? t['com.bridgeflow.page-properties.hide-property.one']({
                        count: hide.toString(),
                      })
                    : t['com.bridgeflow.page-properties.hide-property.more']({
                        count: hide.toString(),
                      })
              }
            >
              {properties.map(property => (
                <WorkspacePropertyRow
                  key={property.id}
                  propertyInfo={property}
                  defaultOpenEditMenu={newPropertyId === property.id}
                  propertyInfoReadonly={!canEditPropertyInfo}
                  readonly={!canEditProperty}
                />
              ))}
              {!canEditPropertyInfo ? (
                <Button
                  variant="plain"
                  prefix={<PlusIcon />}
                  className={styles.addPropertyButton}
                >
                  {t['com.bridgeflow.page-properties.add-property']()}
                </Button>
              ) : (
                <Menu
                  items={
                    <CreatePropertyMenuItems onCreated={onPropertyAdded} />
                  }
                  contentOptions={{
                    onClick(e) {
                      e.stopPropagation();
                    },
                  }}
                >
                  <Button
                    variant="plain"
                    prefix={<PlusIcon />}
                    className={styles.addPropertyButton}
                  >
                    {t['com.bridgeflow.page-properties.add-property']()}
                  </Button>
                </Menu>
              )}
            </PropertyCollapsibleContent>
          </PropertyCollapsibleSection>
          <Divider size="thinner" />

          <DocDatabaseBacklinkInfo />

          {backlinks && backlinks.length > 0 ? (
            <>
              <LinksRow
                className={styles.linksRow}
                references={backlinks}
                count={backlinks.length}
                label={t['com.bridgeflow.page-properties.backlinks']()}
              />
              <Divider size="thinner" />
            </>
          ) : null}
          {links && links.length > 0 ? (
            <>
              <LinksRow
                className={styles.linksRow}
                references={links}
                count={links.length}
                label={t['com.bridgeflow.page-properties.outgoing-links']()}
              />
              <Divider size="thinner" />
            </>
          ) : null}
        </Suspense>
      </Scrollable.Viewport>
      <Scrollable.Scrollbar className={styles.scrollBar} />
    </Scrollable.Root>
  );
};
