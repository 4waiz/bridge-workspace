import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from './supabase-client';

const OPEN_EVENT = 'bridge-open-profile';

function initials(label: string) {
  const parts = label.trim().split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function BridgeProfile() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = () => {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setName(
          (data.user?.user_metadata?.name as string) ??
            (data.user?.user_metadata?.full_name as string) ??
            ''
        );
      });
      setSavedMsg(null);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  if (!open) return null;

  const email = user?.email ?? '';
  const display = name || (user?.user_metadata?.name as string) || email || 'Account';
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string) ||
    (user?.user_metadata?.picture as string) ||
    '';
  const verified = !!user?.email_confirmed_at;

  const save = async () => {
    setSaving(true);
    setSavedMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name, full_name: name },
      });
      if (error) throw error;
      setSavedMsg('Profile updated.');
    } catch (e: any) {
      setSavedMsg(e?.message ?? 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
  };

  return (
    <div className="bfp-overlay" onClick={() => setOpen(false)}>
      <style>{STYLES}</style>
      <div className="bfp-card" onClick={e => e.stopPropagation()}>
        <button className="bfp-close" onClick={() => setOpen(false)} aria-label="Close">
          ×
        </button>

        <div className="bfp-header">
          {avatarUrl ? (
            <img className="bfp-avatar" src={avatarUrl} alt={display} />
          ) : (
            <div className="bfp-avatar bfp-avatar-fallback">{initials(display)}</div>
          )}
          <div className="bfp-id">
            <div className="bfp-name">{display}</div>
            <div className="bfp-email">
              {email}
              {verified && <span className="bfp-verified">✓ Verified</span>}
            </div>
          </div>
        </div>

        <div className="bfp-section">
          <label className="bfp-label">Display name</label>
          <div className="bfp-row">
            <input
              className="bfp-input"
              value={name}
              placeholder="Add your name"
              onChange={e => setName(e.target.value)}
            />
            <button className="bfp-save" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
          {savedMsg && <div className="bfp-msg">{savedMsg}</div>}
        </div>

        <div className="bfp-meta">
          <div className="bfp-meta-row">
            <span>Email</span>
            <b>{email || '—'}</b>
          </div>
          <div className="bfp-meta-row">
            <span>Status</span>
            <b>{verified ? 'Email verified' : 'Pending verification'}</b>
          </div>
          <div className="bfp-meta-row">
            <span>Member since</span>
            <b>{fmtDate(user?.created_at)}</b>
          </div>
          <div className="bfp-meta-row">
            <span>Last sign in</span>
            <b>{fmtDate(user?.last_sign_in_at)}</b>
          </div>
          <div className="bfp-meta-row">
            <span>User ID</span>
            <b className="bfp-mono">{user?.id ?? '—'}</b>
          </div>
        </div>

        <button className="bfp-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}

const STYLES = `
.bfp-overlay{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;
  background:rgba(45,52,63,.55);backdrop-filter:blur(2px);
  font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;animation:bfp-fade .12s ease}
@keyframes bfp-fade{from{opacity:0}to{opacity:1}}
.bfp-card{position:relative;width:440px;max-width:calc(100vw - 32px);max-height:calc(100vh - 48px);overflow:auto;
  background:#fff;border-radius:16px;padding:28px;box-shadow:0 30px 80px -24px rgba(45,52,63,.6);color:#3d4451}
.bfp-close{position:absolute;top:14px;right:16px;border:0;background:transparent;font-size:24px;line-height:1;
  color:#b9bec5;cursor:pointer}
.bfp-close:hover{color:#3d4451}

.bfp-header{display:flex;align-items:center;gap:16px;padding-bottom:22px;border-bottom:1px solid #eef0f2;margin-bottom:20px}
.bfp-avatar{width:64px;height:64px;border-radius:50%;object-fit:cover;flex:0 0 auto}
.bfp-avatar-fallback{display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;
  background:linear-gradient(135deg,#f15a29,#e24e20);box-shadow:0 6px 16px -6px rgba(241,90,41,.6)}
.bfp-id{min-width:0}
.bfp-name{font-size:20px;font-weight:700;color:#2f343f;line-height:1.2}
.bfp-email{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#8a9099;margin-top:4px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bfp-verified{flex:0 0 auto;font-size:11px;font-weight:700;color:#1a7f37;background:#e7f6ec;border-radius:20px;padding:2px 8px}

.bfp-section{margin-bottom:20px}
.bfp-label{display:block;font-size:12px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;color:#8a9099;margin-bottom:8px}
.bfp-row{display:flex;gap:8px}
.bfp-input{flex:1;height:42px;padding:0 13px;font-size:15px;color:#2f343f;border:1.5px solid #d8dbe0;border-radius:9px;
  outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
.bfp-input:focus{border-color:#f15a29;box-shadow:0 0 0 3px rgba(241,90,41,.16)}
.bfp-save{height:42px;padding:0 18px;border:0;border-radius:9px;background:#3d4451;color:#fff;font-weight:600;font-size:14px;
  cursor:pointer;font-family:inherit;transition:background .15s}
.bfp-save:hover{background:#2f343f}
.bfp-save:disabled{opacity:.6;cursor:default}
.bfp-msg{margin-top:8px;font-size:12.5px;color:#1a7f37}

.bfp-meta{background:#f6f7f9;border:1px solid #eef0f2;border-radius:12px;padding:6px 16px;margin-bottom:22px}
.bfp-meta-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:11px 0;
  border-bottom:1px solid #eef0f2;font-size:13.5px}
.bfp-meta-row:last-child{border-bottom:0}
.bfp-meta-row span{color:#8a9099}
.bfp-meta-row b{color:#3d4451;font-weight:600;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}
.bfp-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}

.bfp-logout{width:100%;height:46px;border:1.5px solid #fecdc9;border-radius:10px;background:#fff;color:#b42318;
  font-weight:700;font-size:14.5px;cursor:pointer;font-family:inherit;transition:all .15s}
.bfp-logout:hover{background:#fef3f2;border-color:#f5a39c}
`;
