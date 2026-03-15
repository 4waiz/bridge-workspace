# EDGE Workspace

EDGE Workspace is a frontend-first collaborative workspace built with Next.js App Router. It includes a Miro-inspired marketing site, dashboard, templates center, interactive board workspace, executive brief mode, presentation mode, bilingual English/Arabic support, RTL behavior, and local-first persistence.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui-style component primitives
- Framer Motion
- Lucide Icons
- Zustand
- cmdk
- tldraw
- React Hook Form + Zod
- next-themes

## Routes

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/templates`
- `/boards/[id]`
- `/settings`
- `/profile`
- `/pricing`
- custom `not-found`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production check:

```bash
npm run lint
npm run build
```

## Architecture

The app is organized around a small set of reusable shells and data layers:

- `app/`
  App Router entrypoints for each route.
- `components/marketing/`
  Header, mega menu, hero preview, landing sections, and pricing/marketing building blocks.
- `components/dashboard/`
  Sidebar navigation, workspace header, filter bar, board cards, and table rows.
- `components/board/`
  Board workspace shell, inspector, executive brief panel, and presentation mode.
- `components/shared/`
  App shell, auth surface, language toggle, logo, command palette, badges, empty states, and general helpers.
- `components/ui/`
  Reusable shadcn/ui-style primitives.
- `lib/mock-data/`
  Seeded workspace, board, template, notification, and marketing content.
- `lib/theme/`
  Brand token source of truth.
- `lib/i18n/`
  Message catalogs for English and Arabic.
- `store/`
  Zustand stores for persistent workspace data and transient UI state.
- `types/`
  Shared application types.

## Mock persistence

The app persists its main workspace state through Zustand `persist` with browser `localStorage`.

Persisted data includes:

- seeded users
- boards and board metadata
- saved board snapshots from tldraw
- favorites
- classification and visibility changes
- generated executive briefs
- notifications and activity state
- workspace preferences such as collection view, theme, density, and defaults

Additional page-level UI filters, like dashboard filter state and locale preference, are also stored locally.

## Whiteboard implementation

The board route uses `tldraw` with a custom EDGE shell:

- custom top app bar
- custom left tool rail
- custom right inspector
- local autosave through stored editor snapshots
- local mock executive brief generation
- presentation mode
- export actions
- image upload into the canvas

Seed boards are initialized from local board utilities in [`lib/board-utils.ts`](./lib/board-utils.ts) and then persisted as live snapshots.

## Branding and theme tokens

Brand tokens live in [`lib/theme/tokens.ts`](./lib/theme/tokens.ts) and global CSS variables in [`app/globals.css`](./app/globals.css).

Primary brand colors:

- `--brand-primary: #E36436`
- `--brand-primary-hover: #CF582F`
- `--brand-ink: #454B50`
- `--brand-ink-strong: #2F353A`
- `--brand-bg: #F4F4F2`
- `--brand-surface: #FFFFFF`
- `--brand-border: #D9D7D2`

To rebrand:

1. Update `lib/theme/tokens.ts`.
2. Update matching CSS variables in `app/globals.css`.
3. Replace `public/logo.png` if you want to swap the current fallback logo.

## Logo and favicon wiring

The app references `public/logo.png` for:

- navbar and shared logo component
- auth pages
- loading screen
- metadata icons in `app/layout.tsx`
- empty state and brand callouts

If you replace the asset, keep the same filename for instant reuse across the app.

## i18n and RTL

English and Arabic are supported through the provider in [`components/shared/i18n-provider.tsx`](./components/shared/i18n-provider.tsx).

Behavior:

- locale is persisted in `localStorage` and a cookie
- `html[dir]` and `html[lang]` are updated automatically
- Arabic uses RTL direction and an Arabic font fallback
- major navigation and shared UI copy is localized

## Responsive behavior

The app is desktop-first, but key responsive behavior is implemented:

- marketing header collapses into a mobile drawer
- app sidebar becomes a sheet on smaller screens
- dashboard views collapse from grid/table into stacked cards
- board inspector shifts below the canvas on narrow layouts

## Replacing mock persistence with Supabase later

The current code is already structured for a backend swap:

1. Replace the Zustand seed bootstrap in [`store/workspace-store.ts`](./store/workspace-store.ts) with fetched workspace/user/board records.
2. Persist board snapshots and board metadata to Supabase tables instead of `localStorage`.
3. Replace local comments, notifications, and activity arrays with live queries and mutations.
4. Move auth screens from demo navigation to Supabase Auth.
5. Add realtime presence and comment syncing around the board route.

The main UI shell, route structure, and component boundaries can remain largely unchanged.

## Known limitations

- Collaboration is local-first only; there is no realtime multi-user sync yet.
- Arabic localization is broad across shared UI, but not every long-form marketing paragraph is fully translated.
- Executive brief generation is heuristic and local, not model-backed.
- Presentation mode depends on frame shapes already present on the board.
- Billing and team management are placeholders in settings, as requested.

## Productionizing next

- Add Supabase Auth, Postgres persistence, and realtime presence.
- Move board comments and activity to backend events.
- Add automated tests for route rendering and store actions.
- Add richer Arabic copy coverage across all long-form marketing sections.
- Add server analytics, audit logging, and role-based permissions.
