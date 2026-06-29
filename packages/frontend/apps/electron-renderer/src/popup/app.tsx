import { ThemeProvider } from '@bridgeflow/core/components/theme-provider';
import { configureElectronStateStorageImpls } from '@bridgeflow/core/desktop/storage';
import { configureDesktopApiModule } from '@bridgeflow/core/modules/desktop-api';
import { configureI18nModule, I18nProvider } from '@bridgeflow/core/modules/i18n';
import { configureStorageModule } from '@bridgeflow/core/modules/storage';
import { configureEssentialThemeModule } from '@bridgeflow/core/modules/theme';
import { appInfo } from '@bridgeflow/electron-api';
import { Framework, FrameworkRoot } from '@kanban-studios/infra';

import * as styles from './app.css';
import { Recording } from './recording';

const framework = new Framework();
configureI18nModule(framework);
configureEssentialThemeModule(framework);
configureStorageModule(framework);
configureElectronStateStorageImpls(framework);
configureDesktopApiModule(framework);
const frameworkProvider = framework.provider();

const mode = appInfo?.windowName as 'notification' | 'recording';

export function App() {
  return (
    <FrameworkRoot framework={frameworkProvider}>
      <ThemeProvider>
        <I18nProvider>
          <div className={styles.root} data-is-windows={environment.isWindows}>
            {mode === 'recording' && <Recording />}
          </div>
        </I18nProvider>
      </ThemeProvider>
    </FrameworkRoot>
  );
}
