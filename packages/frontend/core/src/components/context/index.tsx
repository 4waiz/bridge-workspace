import { ConfirmModalProvider, PromptModalProvider } from '@bridgeflow/component';
import { ProviderComposer } from '@bridgeflow/component/provider-composer';
import { ThemeProvider } from '@bridgeflow/core/components/theme-provider';
import type { createStore } from 'jotai';
import { Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import { useImageAntialiasing } from '../hooks/use-image-antialiasing';

export type BridgeFlowContextProps = PropsWithChildren<{
  store?: ReturnType<typeof createStore>;
}>;

export function BridgeFlowContext(props: BridgeFlowContextProps) {
  useImageAntialiasing();
  return (
    <ProviderComposer
      contexts={useMemo(
        () =>
          [
            <Provider key="JotaiProvider" store={props.store} />,
            <ThemeProvider key="ThemeProvider" />,
            <ConfirmModalProvider key="ConfirmModalProvider" />,
            <PromptModalProvider key="PromptModalProvider" />,
          ].filter(Boolean),
        [props.store]
      )}
    >
      {props.children}
    </ProviderComposer>
  );
}
