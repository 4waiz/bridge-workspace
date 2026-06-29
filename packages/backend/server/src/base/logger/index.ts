import { Global, Module } from '@nestjs/common';

import { ConfigModule } from '../config';
import { BridgeFlowLogger } from './service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [BridgeFlowLogger],
  exports: [BridgeFlowLogger],
})
export class LoggerModule {}

export { BridgeFlowLogger } from './service';
