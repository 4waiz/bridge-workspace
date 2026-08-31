import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  BUSINESS_OPS_PASSPHRASE,
  fetchOverlayUrl,
  OVERLAY_PERIOD_MS,
  removeOverlayImage,
  uploadOverlayImage,
} from '../okr-dashboard/business-ops';

const T = {
  card: '#ffffff',
  border: '#e6e8ee',
  text: '#20242e',
  sub: '#7b8290',
  accent: '#f15a29',
};

const UNLOCK_KEY = 'bridge-business-ops-unlocked';

function rgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

/**
 * Swaps the full-screen image the OKR wall board alternates with.
 *
 * The passphrase keeps the panel out of the way of people editing their team's
 * OKRs — it is not a security boundary (it ships in the bundle). The upload
 * itself is gated by Supabase auth via the RLS policies in migration 0004.
 */
export function BusinessOpsPanel() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [entry, setEntry] = useState('');
  const [wrong, setWrong] = useState(false);
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    fetchOverlayUrl()
      .then(next => {
        if (!cancelled) setUrl(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  const submit = useCallback(() => {
    if (entry.trim() === BUSINESS_OPS_PASSPHRASE) {
      setUnlocked(true);
      setWrong(false);
      setEntry('');
      try {
        sessionStorage.setItem(UNLOCK_KEY, '1');
      } catch {
        /* a locked-down browser just means re-entering it next visit */
      }
    } else {
      setWrong(true);
    }
  }, [entry]);

  const onPick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const next = await uploadOverlayImage(file);
      setUrl(next);
      setNote('Uploaded. Every open dashboard picks it up within seconds.');
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }, []);

  const onRemove = useCallback(async () => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await removeOverlayImage();
      setUrl(null);
      setNote('Removed. The wall board will show only OKRs.');
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }, []);

  // Read as "5 minutes" / "30 seconds" rather than a raw second count.
  const secs = Math.round(OVERLAY_PERIOD_MS / 1000);
  const period =
    secs >= 60
      ? `${secs / 60} minute${secs === 60 ? '' : 's'}`
      : `${secs} seconds`;

  return (
    <div style={S.panel}>
      <div style={S.kicker}>
        <span style={{ fontSize: 14 }}>🖥</span> BUSINESS OPS DASHBOARD
      </div>

      {!unlocked ? (
        <>
          <div style={S.blurb}>
            Enter the passphrase to change the image shown full-screen on the
            OKR wall board.
          </div>
          <div style={S.row}>
            <input
              type="password"
              value={entry}
              placeholder="Passphrase"
              style={{
                ...S.input,
                borderColor: wrong ? '#e5341f' : T.border,
              }}
              onChange={e => {
                setEntry(e.target.value);
                setWrong(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') submit();
              }}
            />
            <button style={S.primaryBtn} onClick={submit} type="button">
              Unlock
            </button>
          </div>
          {wrong ? (
            <div style={S.error}>That passphrase is not right.</div>
          ) : null}
        </>
      ) : (
        <>
          <div style={S.blurb}>
            The board shows the OKRs for {period}, then this image for {period},
            and repeats. Uploading here replaces the image everywhere — no
            redeploy, no reload.
          </div>

          {url ? (
            <img src={url} alt="Current Business Ops slide" style={S.preview} />
          ) : url === undefined ? (
            <div style={S.emptyPreview}>Loading the current image...</div>
          ) : (
            <div style={S.emptyPreview}>No image selected.</div>
          )}

          <div style={S.row}>
            <button
              style={{ ...S.primaryBtn, opacity: busy ? 0.6 : 1 }}
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              type="button"
            >
              {busy ? 'Uploading…' : 'Upload new image'}
            </button>
            <button
              style={{ ...S.secondaryBtn, opacity: busy || !url ? 0.55 : 1 }}
              onClick={() => void onRemove()}
              disabled={busy || !url}
              type="button"
            >
              Remove image
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => void onPick(e)}
            />
          </div>

          {note ? <div style={S.note}>{note}</div> : null}
          {error ? <div style={S.error}>{error}</div> : null}
        </>
      )}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  panel: {
    padding: '16px 20px',
    border: `1px solid ${rgba(T.accent, 0.25)}`,
    background: rgba(T.accent, 0.05),
    borderRadius: 14,
    marginBottom: 18,
  },
  kicker: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12.5,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: T.accent,
    marginBottom: 4,
  },
  blurb: { color: T.sub, fontSize: 13, marginBottom: 12, lineHeight: 1.5 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  input: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid',
    background: T.card,
    color: T.text,
    fontSize: 14,
    minWidth: 200,
  },
  primaryBtn: {
    padding: '9px 16px',
    borderRadius: 10,
    border: 'none',
    background: T.accent,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '9px 16px',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: T.card,
    color: T.text,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  preview: {
    display: 'block',
    width: '100%',
    maxHeight: 220,
    objectFit: 'contain',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: T.card,
    marginBottom: 12,
  },
  emptyPreview: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    minHeight: 120,
    borderRadius: 10,
    border: `1px dashed ${T.border}`,
    background: T.card,
    color: T.sub,
    fontSize: 13,
    marginBottom: 12,
  },
  note: { marginTop: 10, fontSize: 13, color: '#2eb85c' },
  error: { marginTop: 10, fontSize: 13, color: '#e5341f' },
};
