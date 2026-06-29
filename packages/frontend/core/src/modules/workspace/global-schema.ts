import { AIChatBlockSchema } from '@bridgeflow/core/blocksuite/ai/blocks/ai-chat-block/model';
import { TranscriptionBlockSchema } from '@bridgeflow/core/blocksuite/ai/blocks/transcription-block/model';
import { BridgeFlowSchemas } from '@blocksuite/bridgeflow/schemas';
import { Schema } from '@blocksuite/bridgeflow/store';

let _schema: Schema | null = null;
export function getBridgeFlowWorkspaceSchema() {
  if (!_schema) {
    _schema = new Schema();

    _schema.register([
      ...BridgeFlowSchemas,
      AIChatBlockSchema,
      TranscriptionBlockSchema,
    ]);
  }

  return _schema;
}
