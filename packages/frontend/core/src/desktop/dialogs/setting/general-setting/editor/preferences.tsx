import { Button } from '@bridgeflow/component';
import {
  SettingRow,
  SettingWrapper,
} from '@bridgeflow/component/setting-components';
import { useI18n } from '@bridgeflow/i18n';

export const Preferences = () => {
  const t = useI18n();
  return (
    <SettingWrapper
      title={t['com.bridgeflow.settings.editorSettings.preferences']()}
    >
      <SettingRow
        name={t[
          'com.bridgeflow.settings.editorSettings.preferences.export.title'
        ]()}
        desc={t[
          'com.bridgeflow.settings.editorSettings.preferences.export.description'
        ]()}
      >
        <Button>Export</Button>
      </SettingRow>
      <SettingRow
        name={t[
          'com.bridgeflow.settings.editorSettings.preferences.import.title'
        ]()}
        desc={t[
          'com.bridgeflow.settings.editorSettings.preferences.import.description'
        ]()}
      >
        <Button>Import</Button>
      </SettingRow>
    </SettingWrapper>
  );
};
