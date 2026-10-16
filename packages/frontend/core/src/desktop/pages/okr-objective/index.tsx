import { OKR_KEYFRAMES } from '../okr-dashboard/okr-glass';
import { OkrObjectiveDetail } from './detail';

/**
 * /okr-objective/:objectiveId - visual drill-down for a single objective
 * (progress gauge, status, team comparison, key results & initiatives).
 */
export const Component = () => {
  return (
    <>
      {/* keyframes can't live in an inline style object - inject once here. */}
      <style>{OKR_KEYFRAMES}</style>
      <OkrObjectiveDetail />
    </>
  );
};
