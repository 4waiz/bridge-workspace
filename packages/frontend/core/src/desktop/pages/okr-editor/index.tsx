import { OkrEditor } from './editor';

/**
 * /okr-editor - department picker + structured, Supabase-backed OKR editor.
 * Pick your team, edit its objectives + progress, Save. Data flows live to
 * /okr-dashboard.
 */
export const Component = () => {
  return <OkrEditor />;
};
