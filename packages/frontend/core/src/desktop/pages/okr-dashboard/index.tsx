import { OkrDashboard } from './dashboard';
import { OKR_KEYFRAMES } from './okr-glass';

/**
 * /okr-dashboard - full-screen, read-only, live rollup of every team's
 * Operational Excellence metrics. Reads structured data from Supabase and
 * updates in realtime for everyone.
 */
export const Component = () => {
  return (
    <>
      {/* keyframes can't live in an inline style object - inject once here. */}
      <style>{OKR_KEYFRAMES}</style>
      <OkrDashboard />
    </>
  );
};
