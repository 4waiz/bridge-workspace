/**
 * Business Ops Dashboard — the full-screen image the OKR board alternates with.
 *
 * The board runs unattended on a wall screen, so the image cannot live in the
 * bundle: swapping it would mean a redeploy. Instead the file goes to the
 * public `business-ops` Storage bucket and a single row in
 * business_ops_overlay points at the current one. That row is published to
 * realtime, so an upload from the editor reaches every open board within
 * seconds without anyone touching the screen.
 */
import { getSupabase } from './okr-data';

export const BUSINESS_OPS_BUCKET = 'business-ops';
export const BUSINESS_OPS_TABLE = 'business_ops_overlay';
export const BUSINESS_OPS_ROW_ID = 'current';

/**
 * Shipped with the app so the wall screen has something to show before anyone
 * has uploaded — and if Storage is unreachable.
 */
export const BUSINESS_OPS_DEFAULT_URL = '/okr/business-ops-default.jpeg';

/**
 * How long the board shows, and how long the image shows. The cycle is one
 * period of OKRs then one period of image, so a full loop is twice this.
 */
export const OVERLAY_PERIOD_MS = 5 * 60_000;

/**
 * Gate on the editor panel. This is a deterrent, not a security boundary — it
 * ships in the client bundle and anyone can read it there. What actually keeps
 * strangers out is Supabase auth: the upload needs a signed-in session, per the
 * RLS policies in migration 0004.
 */
export const BUSINESS_OPS_PASSPHRASE = 'babu123';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** Public URL of the current overlay image, or the bundled default. */
export async function fetchOverlayUrl(): Promise<string> {
  const sb = getSupabase();
  if (!sb?.storage) return BUSINESS_OPS_DEFAULT_URL;

  try {
    const res = await sb
      .from(BUSINESS_OPS_TABLE)
      .select('image_path')
      .eq('id', BUSINESS_OPS_ROW_ID)
      .maybeSingle();
    const path: string | null = res.data?.image_path ?? null;
    if (!path) return BUSINESS_OPS_DEFAULT_URL;

    const { data } = sb.storage.from(BUSINESS_OPS_BUCKET).getPublicUrl(path);
    return data?.publicUrl || BUSINESS_OPS_DEFAULT_URL;
  } catch {
    return BUSINESS_OPS_DEFAULT_URL;
  }
}

/**
 * Upload `file` and point the overlay row at it. Each upload gets its own
 * filename: the bucket is public and therefore CDN-cached, so reusing one name
 * would leave screens showing the old picture until the edge expired it.
 */
export async function uploadOverlayImage(file: File): Promise<string> {
  const sb = getSupabase();
  if (!sb?.storage) throw new Error('Supabase Storage is unavailable.');
  if (!file.type.startsWith('image/')) {
    throw new Error('That file is not an image.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image is larger than 10 MB — please use a smaller file.');
  }

  const ext = (file.name.split('.').pop() || 'jpg')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5);
  const path = `overlay-${Date.now()}.${ext || 'jpg'}`;

  const up = await sb.storage
    .from(BUSINESS_OPS_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (up.error) throw up.error;

  const { data: user } = await sb.auth.getUser();
  const row = await sb.from(BUSINESS_OPS_TABLE).upsert(
    {
      id: BUSINESS_OPS_ROW_ID,
      image_path: path,
      updated_at: new Date().toISOString(),
      updated_by: user.user?.id ?? null,
    },
    { onConflict: 'id' }
  );
  if (row.error) throw row.error;

  const { data } = sb.storage.from(BUSINESS_OPS_BUCKET).getPublicUrl(path);
  return data?.publicUrl || BUSINESS_OPS_DEFAULT_URL;
}

/** Live updates for the overlay row. Returns an unsubscribe fn. */
export function subscribeOverlay(onChange: () => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb.channel('business-ops-overlay-live');
  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: BUSINESS_OPS_TABLE },
    onChange
  );
  channel.subscribe();

  return () => {
    try {
      sb.removeChannel(channel);
    } catch {
      /* ignore */
    }
  };
}
