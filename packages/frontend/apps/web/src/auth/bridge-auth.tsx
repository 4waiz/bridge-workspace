import { type FormEvent, useState } from 'react';

import { BRIDGE_ICON, BRIDGE_WORDMARK_LIGHT } from './logos';
import { supabase } from './supabase-client';

type Mode = 'signin' | 'signup';

const FEATURES = [
  'AI-powered canvas for notes, docs & whiteboards',
  'Real-time collaboration across your workspace',
  'Your ideas, organised — folders, tags & collections',
];

export function BridgeAuthPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // success → AuthGate's onAuthStateChange swaps to the app
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          // auto signed-in (email confirmation disabled) → gate flips
        } else if (data.user && data.user.identities?.length === 0) {
          setError('An account with this email already exists. Try signing in.');
        } else {
          setInfo(
            'Account created. Check your inbox to confirm your email, then sign in.'
          );
          setMode('signin');
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Enter your email above first, then tap “Forgot password”.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setInfo('Password reset link sent. Check your email.');
    } catch (err: any) {
      setError(err?.message ?? 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bfauth-root">
      <style>{STYLES}</style>

      {/* ---- Brand panel ---- */}
      <aside className="bfauth-brand">
        <div className="bfauth-brand-top">
          <img className="bfauth-wordmark" src={BRIDGE_WORDMARK_LIGHT} alt="BRIDGE" />
        </div>
        <div className="bfauth-brand-mid">
          <p className="bfauth-eyebrow">AI INNOVATION CANVAS</p>
          <h1 className="bfauth-headline">
            Where ideas
            <br />
            become <span className="bfauth-accent">flow</span>.
          </h1>
          <span className="bfauth-rule" />
          <ul className="bfauth-features">
            {FEATURES.map(f => (
              <li key={f}>
                <span className="bfauth-dot" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="bfauth-brand-foot">
          <span>© {new Date().getFullYear()} Kanban Studios</span>
        </div>
        <div className="bfauth-glow" />
        <div className="bfauth-grid" />
      </aside>

      {/* ---- Form panel ---- */}
      <main className="bfauth-form-wrap">
        <div className="bfauth-card">
          <img className="bfauth-mark" src={BRIDGE_ICON} alt="BRIDGE Flow" />
          <h2 className="bfauth-title">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="bfauth-sub">
            {mode === 'signin'
              ? 'Sign in to your BRIDGE Flow workspace.'
              : 'Start building on the BRIDGE Flow canvas.'}
          </p>

          <div className="bfauth-tabs" role="tablist">
            <button
              className={`bfauth-tab ${mode === 'signin' ? 'is-active' : ''}`}
              onClick={() => switchMode('signin')}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`bfauth-tab ${mode === 'signup' ? 'is-active' : ''}`}
              onClick={() => switchMode('signup')}
              type="button"
            >
              Create account
            </button>
          </div>

          <form onSubmit={onSubmit} className="bfauth-fields" noValidate>
            <label className="bfauth-label">
              Email
              <input
                className="bfauth-input"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="bfauth-label">
              Password
              <div className="bfauth-pw">
                <input
                  className="bfauth-input"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="bfauth-eye"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {mode === 'signup' && (
              <label className="bfauth-label">
                Confirm password
                <input
                  className="bfauth-input"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  disabled={loading}
                />
              </label>
            )}

            {error && <div className="bfauth-msg bfauth-err">{error}</div>}
            {info && <div className="bfauth-msg bfauth-info">{info}</div>}

            <button className="bfauth-submit" type="submit" disabled={loading}>
              {loading ? (
                <span className="bfauth-spinner" />
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>

            {mode === 'signin' && (
              <button
                type="button"
                className="bfauth-forgot"
                onClick={onForgot}
                disabled={loading}
              >
                Forgot password?
              </button>
            )}
          </form>

          <p className="bfauth-switch">
            {mode === 'signin' ? (
              <>
                New to BRIDGE Flow?{' '}
                <button type="button" onClick={() => switchMode('signup')}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}

const STYLES = `
.bfauth-root{position:fixed;inset:0;z-index:2147483600;display:grid;grid-template-columns:1.05fr 1fr;
  font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;color:#3d4451;background:#fff;overflow:auto}
*[class^="bfauth-"]{box-sizing:border-box}

/* brand panel */
.bfauth-brand{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;
  padding:48px 56px;color:#fff;background:linear-gradient(155deg,#434b5a 0%,#3d4451 45%,#2f343f 100%)}
.bfauth-brand-top{position:relative;z-index:2}
.bfauth-wordmark{height:34px;width:auto;display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}
.bfauth-brand-mid{position:relative;z-index:2;max-width:460px}
.bfauth-eyebrow{margin:0 0 18px;font-size:13px;font-weight:600;letter-spacing:3px;color:#f4a58c}
.bfauth-headline{margin:0;font-size:52px;line-height:1.05;font-weight:700;letter-spacing:-.5px}
.bfauth-accent{color:#f15a29}
.bfauth-rule{display:block;width:64px;height:4px;background:#f15a29;border-radius:2px;margin:28px 0 30px}
.bfauth-features{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
.bfauth-features li{display:flex;align-items:center;gap:14px;font-size:16px;color:#dfe2e7;line-height:1.35}
.bfauth-dot{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:#f15a29;box-shadow:0 0 0 4px rgba(241,90,41,.18)}
.bfauth-brand-foot{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;
  font-size:12.5px;color:#aab0ba}
.bfauth-brand-foot a{color:#f4a58c;text-decoration:none}
.bfauth-brand-foot a:hover{text-decoration:underline}
.bfauth-glow{position:absolute;width:520px;height:520px;right:-180px;top:-160px;border-radius:50%;
  background:radial-gradient(circle,rgba(241,90,41,.42),transparent 62%);filter:blur(8px);z-index:1}
.bfauth-grid{position:absolute;inset:0;z-index:0;opacity:.5;
  background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
  background-size:34px 34px;mask-image:linear-gradient(160deg,#000 10%,transparent 70%)}

/* form panel */
.bfauth-form-wrap{display:flex;align-items:center;justify-content:center;padding:40px 24px;background:#f6f7f9}
.bfauth-card{width:100%;max-width:420px;background:#fff;border:1px solid #e7e9ec;border-radius:14px;
  padding:40px 38px;box-shadow:0 24px 60px -28px rgba(45,52,63,.45)}
.bfauth-mark{width:52px;height:52px;object-fit:contain;margin-bottom:20px}
.bfauth-title{margin:0;font-size:26px;font-weight:700;letter-spacing:-.3px;color:#2f343f}
.bfauth-sub{margin:8px 0 24px;font-size:14.5px;color:#8a9099;line-height:1.4}

.bfauth-tabs{display:flex;gap:4px;padding:4px;background:#eef0f2;border-radius:10px;margin-bottom:24px}
.bfauth-tab{flex:1;border:0;background:transparent;padding:9px 0;border-radius:7px;font-size:14px;font-weight:600;
  color:#8a9099;cursor:pointer;transition:all .15s ease;font-family:inherit}
.bfauth-tab.is-active{background:#fff;color:#3d4451;box-shadow:0 1px 3px rgba(45,52,63,.14)}

.bfauth-fields{display:flex;flex-direction:column;gap:16px}
.bfauth-label{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:#5a616c}
.bfauth-input{width:100%;height:44px;padding:0 14px;font-size:15px;color:#2f343f;background:#fff;
  border:1.5px solid #d8dbe0;border-radius:9px;outline:none;transition:border-color .15s,box-shadow .15s;font-family:inherit}
.bfauth-input::placeholder{color:#b9bec5}
.bfauth-input:focus{border-color:#f15a29;box-shadow:0 0 0 3px rgba(241,90,41,.16)}
.bfauth-input:disabled{background:#f3f4f6;cursor:not-allowed}
.bfauth-pw{position:relative;display:flex;align-items:center}
.bfauth-eye{position:absolute;right:10px;border:0;background:transparent;color:#8a9099;font-size:12.5px;font-weight:600;
  cursor:pointer;padding:6px;font-family:inherit}
.bfauth-eye:hover{color:#f15a29}

.bfauth-msg{font-size:13px;line-height:1.4;padding:10px 12px;border-radius:8px}
.bfauth-err{color:#b42318;background:#fef3f2;border:1px solid #fecdc9}
.bfauth-info{color:#3d4451;background:#fdeee8;border:1px solid #f7c6b3}

.bfauth-submit{height:46px;margin-top:4px;border:0;border-radius:9px;background:#f15a29;color:#fff;font-size:15px;
  font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:background .15s,transform .05s;font-family:inherit}
.bfauth-submit:hover{background:#e24e20}
.bfauth-submit:active{transform:translateY(1px)}
.bfauth-submit:disabled{opacity:.7;cursor:default}
.bfauth-spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%;
  animation:bfauth-spin .7s linear infinite}
@keyframes bfauth-spin{to{transform:rotate(360deg)}}

.bfauth-forgot{align-self:center;border:0;background:transparent;color:#8a9099;font-size:13px;cursor:pointer;
  padding:4px;font-family:inherit}
.bfauth-forgot:hover{color:#f15a29}

.bfauth-switch{margin:22px 0 0;text-align:center;font-size:13.5px;color:#8a9099}
.bfauth-switch button{border:0;background:transparent;color:#f15a29;font-weight:700;cursor:pointer;font-size:13.5px;
  font-family:inherit;padding:0}
.bfauth-switch button:hover{text-decoration:underline}

@media (max-width:880px){
  .bfauth-root{grid-template-columns:1fr}
  .bfauth-brand{display:none}
  .bfauth-form-wrap{background:#fff}
}
`;
