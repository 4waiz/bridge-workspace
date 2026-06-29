import type { useI18n } from '@bridgeflow/i18n';
import { track } from '@bridgeflow/track';
import { SettingsIcon } from '@blocksuite/icons/rc';
import { appSettingAtom } from '@kanban-studios/infra';
import type { createStore } from 'jotai';
import type { useTheme } from 'next-themes';

import type { EditorSettingService } from '../modules/editor-setting';
import { registerBridgeFlowCommand } from './registry';

export function registerBridgeFlowSettingsCommands({
  t,
  store,
  theme,
  editorSettingService,
}: {
  t: ReturnType<typeof useI18n>;
  store: ReturnType<typeof createStore>;
  theme: ReturnType<typeof useTheme>;
  editorSettingService: EditorSettingService;
}) {
  const unsubs: Array<() => void> = [];
  const updateSettings = editorSettingService.editorSetting.set.bind(
    editorSettingService.editorSetting
  );
  const settings$ = editorSettingService.editorSetting.settings$;

  // color modes
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:change-color-mode-to-auto',
      label: `${t['com.bridgeflow.cmdk.bridgeflow.color-mode.to']()} ${t[
        'com.bridgeflow.themeSettings.system'
      ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'system',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'theme',
          value: 'system',
        });
        theme.setTheme('system');
      },
    })
  );
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:change-color-mode-to-dark',
      label: `${t['com.bridgeflow.cmdk.bridgeflow.color-mode.to']()} ${t[
        'com.bridgeflow.themeSettings.dark'
      ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'dark',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'theme',
          value: 'dark',
        });
        theme.setTheme('dark');
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:change-color-mode-to-light',
      label: `${t['com.bridgeflow.cmdk.bridgeflow.color-mode.to']()} ${t[
        'com.bridgeflow.themeSettings.light'
      ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'light',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'theme',
          value: 'light',
        });

        theme.setTheme('light');
      },
    })
  );

  // Font styles
  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:change-font-style-to-sans',
      label: `${t['com.bridgeflow.cmdk.bridgeflow.font-style.to']()} ${t[
        'com.bridgeflow.appearanceSettings.fontStyle.sans'
      ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Sans',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fontStyle',
          value: 'Sans',
        });

        updateSettings('fontFamily', 'Sans');
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:change-font-style-to-serif',
      label: `${t['com.bridgeflow.cmdk.bridgeflow.font-style.to']()} ${t[
        'com.bridgeflow.appearanceSettings.fontStyle.serif'
      ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Serif',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fontStyle',
          value: 'Serif',
        });

        updateSettings('fontFamily', 'Serif');
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: 'bridgeflow:change-font-style-to-mono',
      label: `${t['com.bridgeflow.cmdk.bridgeflow.font-style.to']()} ${t[
        'com.bridgeflow.appearanceSettings.fontStyle.mono'
      ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Mono',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fontStyle',
          value: 'Mono',
        });

        updateSettings('fontFamily', 'Mono');
      },
    })
  );

  // Layout Style
  unsubs.push(
    registerBridgeFlowCommand({
      id: `bridgeflow:change-client-border-style`,
      label: () => `${t['com.bridgeflow.cmdk.bridgeflow.client-border-style.to']()} ${t[
        store.get(appSettingAtom).clientBorder
          ? 'com.bridgeflow.cmdk.bridgeflow.switch-state.off'
          : 'com.bridgeflow.cmdk.bridgeflow.switch-state.on'
      ]()}
        `,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => BUILD_CONFIG.isElectron,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'clientBorder',
          value: store.get(appSettingAtom).clientBorder ? 'off' : 'on',
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          clientBorder: !prev.clientBorder,
        }));
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: `bridgeflow:change-full-width-layout`,
      label: () =>
        `${t[
          settings$.value.fullWidthLayout
            ? 'com.bridgeflow.cmdk.bridgeflow.default-page-width-layout.standard'
            : 'com.bridgeflow.cmdk.bridgeflow.default-page-width-layout.full-width'
        ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fullWidthLayout',
          value: settings$.value.fullWidthLayout ? 'off' : 'on',
        });
        updateSettings('fullWidthLayout', !settings$.value.fullWidthLayout);
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: `bridgeflow:change-noise-background-on-the-sidebar`,
      label: () =>
        `${t[
          'com.bridgeflow.cmdk.bridgeflow.noise-background-on-the-sidebar.to'
        ]()} ${t[
          store.get(appSettingAtom).enableNoisyBackground
            ? 'com.bridgeflow.cmdk.bridgeflow.switch-state.off'
            : 'com.bridgeflow.cmdk.bridgeflow.switch-state.on'
        ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => BUILD_CONFIG.isElectron,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'enableNoisyBackground',
          value: store.get(appSettingAtom).enableNoisyBackground ? 'off' : 'on',
        });

        store.set(appSettingAtom, prev => ({
          ...prev,
          enableNoisyBackground: !prev.enableNoisyBackground,
        }));
      },
    })
  );

  unsubs.push(
    registerBridgeFlowCommand({
      id: `bridgeflow:change-translucent-ui-on-the-sidebar`,
      label: () =>
        `${t['com.bridgeflow.cmdk.bridgeflow.translucent-ui-on-the-sidebar.to']()} ${t[
          store.get(appSettingAtom).enableBlurBackground
            ? 'com.bridgeflow.cmdk.bridgeflow.switch-state.off'
            : 'com.bridgeflow.cmdk.bridgeflow.switch-state.on'
        ]()}`,
      category: 'bridgeflow:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        BUILD_CONFIG.isElectron && environment.isMacOs,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'enableBlurBackground',
          value: store.get(appSettingAtom).enableBlurBackground ? 'off' : 'on',
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          enableBlurBackground: !prev.enableBlurBackground,
        }));
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
