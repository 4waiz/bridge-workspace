import { WinstonLogger } from 'nest-winston';

import { BridgeFlowLogger as RawBridgeFlowLogger } from '../../../base/logger';

export class BridgeFlowLogger extends WinstonLogger {
  override error(
    message: any,
    stackOrError?: Error | string | unknown,
    context?: string
  ) {
    super.error(
      message,
      RawBridgeFlowLogger.formatStack(stackOrError) as string,
      context
    );
  }
}
