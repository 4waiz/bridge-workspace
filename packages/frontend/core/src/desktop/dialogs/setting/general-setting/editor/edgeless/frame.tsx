import { MenuItem, MenuTrigger } from '@bridgeflow/component';
import { SettingRow } from '@bridgeflow/component/setting-components';
import { EditorSettingService } from '@bridgeflow/core/modules/editor-setting';
import { useI18n } from '@bridgeflow/i18n';
import { DefaultTheme } from '@blocksuite/bridgeflow/model';
import type { Store } from '@blocksuite/bridgeflow/store';
import { useFramework, useLiveData } from '@kanban-studios/infra';
import { isEqual } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import { DropdownMenu } from '../menu';
import { menuTrigger } from '../style.css';
import { usePalettes } from '../utils';
import { Point } from './point';
import { EdgelessSnapshot } from './snapshot';

export const FrameSettings = () => {
  const t = useI18n();
  const framework = useFramework();
  const { editorSetting } = framework.get(EditorSettingService);
  const settings = useLiveData(editorSetting.settings$);
  const { palettes, getCurrentColor } = usePalettes(
    [
      { key: 'Transparent', value: DefaultTheme.transparent },
      ...DefaultTheme.FillColorShortPalettes,
    ],
    DefaultTheme.transparent
  );

  const { background } = settings['bridgeflow:frame'];
  const currentColor = useMemo(() => {
    return getCurrentColor(background);
  }, [getCurrentColor, background]);

  const colorItems = useMemo(() => {
    return palettes.map(({ key, value, resolvedValue }) => {
      const handler = () => {
        editorSetting.set('bridgeflow:frame', { background: value });
      };
      const isSelected = isEqual(background, value);
      return (
        <MenuItem
          key={key}
          onSelect={handler}
          selected={isSelected}
          prefix={<Point color={resolvedValue} />}
        >
          {key}
        </MenuItem>
      );
    });
  }, [editorSetting, background, palettes]);

  const getElements = useCallback((doc: Store) => {
    return doc.getBlocksByFlavour('bridgeflow:frame') || [];
  }, []);

  return (
    <>
      <EdgelessSnapshot
        title={t['com.bridgeflow.settings.editorSettings.edgeless.frame']()}
        docName="frame"
        keyName="bridgeflow:frame"
        getElements={getElements}
      />
      <SettingRow
        name={t[
          'com.bridgeflow.settings.editorSettings.edgeless.frame.background'
        ]()}
        desc={''}
      >
        {currentColor ? (
          <DropdownMenu
            items={colorItems}
            trigger={
              <MenuTrigger
                className={menuTrigger}
                prefix={<Point color={currentColor.resolvedValue} />}
              >
                {currentColor.key}
              </MenuTrigger>
            }
          />
        ) : null}
      </SettingRow>
    </>
  );
};
