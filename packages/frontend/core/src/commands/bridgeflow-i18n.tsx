import type { I18n } from '@bridgeflow/core/modules/i18n';
import type { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { SettingsIcon } from '@blocksuite/icons/rc';

import { registerBridgeFlowCommand } from './registry';

export function registerBridgeFlowLanguageCommands({
  i18n,
  t,
}: {
  i18n: I18n;
  t: ReturnType<typeof useI18n>;
}) {
  // Display Language
  const disposables = i18n.languageList.map(language => {
    return registerBridgeFlowCommand({
      id: `bridgeflow:change-display-language-to-${language.name}`,
      label: `${t['com.bridgeflow.cmdk.bridgeflow.display-language.to']()} ${
        language.originalName
      }`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        i18n.currentLanguage$.value.key !== language.key,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'language',
          value: language.name,
        });

        i18n.changeLanguage(language.key);
      },
    });
  });

  return () => {
    disposables.forEach(dispose => dispose());
  };
}
