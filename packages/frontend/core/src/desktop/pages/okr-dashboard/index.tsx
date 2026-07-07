import { OkrDashboard } from './dashboard';

// keyframes can't live in an inline style object - inject once here.
const KEYFRAMES = `@keyframes okrpulse {
  0%   { box-shadow: 0 0 0 0 rgba(46,184,92,0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(46,184,92,0); }
  100% { box-shadow: 0 0 0 0 rgba(46,184,92,0); }
}`;

/**
 * /okr-dashboard - full-screen, read-only, live rollup of every team's
 * Operational Excellence metrics. Reads structured data from Supabase and
 * updates in realtime for everyone.
 */
export const Component = () => {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <OkrDashboard />
    </>
  );
};
