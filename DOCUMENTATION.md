# SSShopee ERP - Developer Documentation

## Purpose

Technical reference for code structure, runtime behavior, build pipelines, and known engineering issues.

## Runtime Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Recharts
- Capacitor 8 (Android packaging)
- Electron 37 + electron-builder 26 (Windows packaging)

## Source Layout

- `src/main.tsx`: React entrypoint
- `src/App.tsx`: route declaration (`HashRouter`)
- `src/components/Layout.tsx`: app shell + navigation
- `src/pages/*.tsx`: route-level modules
- `src/services/storage.ts`: local persistence and derived metrics
- `vite.config.ts`: web build config (`base: './'`)
- `capacitor.config.ts`: Capacitor metadata and `webDir`
- `electron/main.cjs`: Electron main process
- `electron/preload.cjs`: safe bridge injection

## Routing

Router mode: `HashRouter` (required for Electron `file://` support).

Routes:

- `/` -> `Home`
- `/dashboard` -> `Dashboard`
- `/products` -> `Products`
- `/purchases` -> `Purchases`
- `/income` -> `Income`
- `/expenses` -> `Expenses`
- `/udhar` -> `Udhar`
- `/overview` -> `Overview`

## Local Data Model

Persistence service: `src/services/storage.ts`

Storage keys:

- `products`
- `purchases`
- `income`
- `expenses`
- `udhar`
- `udhar_payments`

Behavior:

- IDs generated with `Date.now()`
- Lists sorted descending by date where implemented
- Udhar paid amount derived by aggregating payments by `udhar_id`
- Udhar auto-marks `PAID` when paid total >= principal
- Dashboard and overview are computed from persisted base datasets

## Build Commands

- `npm run dev`: Vite dev server
- `npm run build`: production web bundle (`dist/`)
- `npm run preview`: preview built web bundle
- `npm run lint`: TypeScript no-emit check
- `npm run desktop:dev`: Vite + Electron local desktop shell
- `npm run desktop:build`: web build + Windows installer packaging

## Android Packaging (Capacitor)

Config: `capacitor.config.ts`

Current config values:

- `appId: com.store.erp`
- `appName: Store ERP`
- `webDir: dist`

Workflow:

```bash
npm run build
npx cap sync android
npx cap open android
```

Native project path: `android/`

## Windows Packaging (Electron)

Main process (`electron/main.cjs`):

- Creates `BrowserWindow` with:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - `sandbox: true`
- Loads `ELECTRON_START_URL` in dev mode
- Loads `dist/index.html` in packaged mode
- Sends external links to default system browser

Preload (`electron/preload.cjs`):

- Exposes `window.desktop.isDesktopApp = true`

Builder config (`package.json > build`):

- `appId: com.shubhamsupershopee.erp`
- `productName: Shubham Super Shopee ERP`
- output directory: `dist_electron`
- target: `nsis`

## Desktop Build Artifacts (Generated)

`npm run desktop:build` generates installer artifacts and raw runtime artifacts. Use them as follows.

| Artifact | Why it is generated | Attention required | Ship to end users? |
|---|---|---|---|
| `dist_electron/Shubham Super Shopee ERP-Setup-<version>.exe` | NSIS installer produced by electron-builder. Handles install/uninstall flow. | Validate install on clean Windows machine before release. | **Yes (primary file to distribute).** |
| `dist_electron/Shubham Super Shopee ERP-Setup-<version>.exe.blockmap` | Metadata for differential/auto-update style delivery. | Keep only if using update/CDN pipeline that needs blockmap files. | No for manual sharing. |
| `dist_electron/win-unpacked/` | Portable unpacked runtime output used internally by builder and for debugging. | Useful for local QA/debugging and startup issue diagnosis. | No for normal consumer distribution. |
| `dist_electron/win-unpacked/Shubham Super Shopee ERP.exe` | Raw executable inside unpacked runtime. | Can be used for internal smoke tests without installer flow. | Not recommended for public distribution. |
| `dist_electron/win-unpacked/resources/app.asar` | Bundled application code/resources archive loaded by Electron. | Relevant only if debugging packaging/runtime issues. | Never ship standalone. |
| `dist_electron/win-unpacked/resources/app.asar.unpacked/` | Native/unpacked files that cannot stay inside `app.asar`. | Leave as generated; builder manages this structure. | Never ship standalone. |
| `dist_electron/win-unpacked/resources/elevate.exe` | NSIS helper binary for elevated install tasks. | Keep untouched. | Not distributed independently. |

Release guidance:

- Consumer distribution file: `dist_electron/Shubham Super Shopee ERP-Setup-<version>.exe`
- Do not send `win-unpacked/` contents to end users unless you explicitly plan to provide a portable build.

## Known Engineering Issues

TypeScript lint currently fails with `Cannot find namespace 'React'` for `React.FormEvent` usage in:

- `src/pages/Products.tsx`
- `src/pages/Purchases.tsx`
- `src/pages/Income.tsx`
- `src/pages/Expenses.tsx`
- `src/pages/Udhar.tsx`

Non-blocking Electron packaging warnings:

- Missing `description` in `package.json`
- Missing `author` in `package.json`
- Default app icon used (no custom `.ico` configured)

## Constraints

- Offline/local-first behavior only
- No backend sync in current implementation
- Clearing local storage removes persisted data
