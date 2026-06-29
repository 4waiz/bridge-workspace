import { ErrorBoundary, type FallbackRender } from '@sentry/react';
import type { FC, PropsWithChildren } from 'react';
import { useCallback } from 'react';

import { BridgeFlowErrorFallback } from './bridgeflow-error-fallback';

export { type FallbackProps } from './error-basic/fallback-creator';

export interface BridgeFlowErrorBoundaryProps extends PropsWithChildren {
  height?: number | string;
  className?: string;
}

/**
 * TODO(@eyhn): Unify with SWRErrorBoundary
 */
export const BridgeFlowErrorBoundary: FC<BridgeFlowErrorBoundaryProps> = props => {
  const fallbackRender: FallbackRender = useCallback(
    fallbackProps => {
      return (
        <BridgeFlowErrorFallback
          {...fallbackProps}
          height={props.height}
          className={props.className}
        />
      );
    },
    [props.height, props.className]
  );

  const onError = useCallback((error: unknown, componentStack?: string) => {
    console.error('Uncaught error:', error, componentStack);
  }, []);

  return (
    <ErrorBoundary fallback={fallbackRender} onError={onError}>
      {props.children}
    </ErrorBoundary>
  );
};
