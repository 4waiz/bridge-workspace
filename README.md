# Bridge Workspace

<p align="center">
  <img src="packages/frontend/admin/src/Icon%20(1).webp" alt="Bridge Workspace logo" width="160" />
</p>

Bridge Workspace is the monorepo for the BridgeWS product, including the frontend apps, backend services, shared editor packages, and repository tooling.

## Development

- `yarn dev`
- `yarn build`
- `yarn test`
- `yarn lint`

## Bridge Workspace AI Assistant

The workspace now includes a floating `Bridge Workspace AI` assistant with:

- Gemini-powered chat for in-app guidance
- Browser microphone input for voice questions
- Optional spoken replies

Set the Gemini key before starting the web app:

```powershell
$env:GEMINI_API_KEY="your_gemini_api_key"
corepack yarn dev
```

For Command Prompt:

```cmd
set GEMINI_API_KEY=your_gemini_api_key
corepack yarn dev
```

## Workspace Layout

- `packages/frontend`: web, admin, desktop, mobile, and shared UI code
- `packages/backend`: backend services and mail rendering
- `blocksuite`: editor framework and playgrounds
- `tools`: build, packaging, and repository tooling

## Notes

- The primary Bridge logo source provided for this workspace is `packages/frontend/admin/src/Icon (1).webp`.
- Shared public brand assets live under `packages/frontend/core/public`.
