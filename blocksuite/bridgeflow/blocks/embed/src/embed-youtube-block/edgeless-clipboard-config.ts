import { EdgelessClipboardConfig } from '@blocksuite/bridgeflow-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';

export class EdgelessClipboardEmbedYoutubeConfig extends EdgelessClipboardConfig {
  static override readonly key = 'bridgeflow:embed-youtube';

  override createBlock(youtubeEmbed: BlockSnapshot): string | null {
    if (!this.surface) return null;
    const {
      xywh,
      style,
      url,
      caption,
      videoId,
      image,
      title,
      description,
      creator,
      creatorUrl,
      creatorImage,
    } = youtubeEmbed.props;

    const embedYoutubeId = this.crud.addBlock(
      'bridgeflow:embed-youtube',
      {
        xywh,
        style,
        url,
        caption,
        videoId,
        image,
        title,
        description,
        creator,
        creatorUrl,
        creatorImage,
      },
      this.surface.model.id
    );
    return embedYoutubeId;
  }
}
