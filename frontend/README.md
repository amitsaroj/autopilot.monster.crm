# Frontend application

The frontend is the Next.js App Router presentation layer for Autopilot Monster CRM. It contains public marketing/auth routes, the tenant workspace, administration routes, shared components and domain API clients. The current implementation uses Next.js 16, React 19, TypeScript, Tailwind CSS, Axios and Zustand; check `package.json` for exact pinned versions.

The parent [README](../README.md) is the main user/developer guide. Architecture is described in [HLD](../docs/HLD.md) and [LLD](../docs/LLD.md); product route coverage and limitations are in the [feature catalog](../docs/FEATURE_CATALOG.md). WhatsApp route and workflow detail is in the root [WhatsApp guide](../README.md#whatsapp-business-platform-and-automation).

## Route areas

- Public product, pricing, content and authentication pages.
- Workspace CRM, AI, voice, WhatsApp, workflows, billing, analytics, marketplace, settings, storage and data-job pages.
- `/admin/*` tenant-administration interface and `/superadmin/*` platform-administration interface.
- `/sub-admin/*` has API support; do not infer a dedicated UI page from the API alone.

Route existence is not proof that an action succeeds for every role/plan or that a connected provider is configured. API guards remain authoritative for authorization.

## API client and environment

Domain service modules under `src/services` use the shared client in `src/lib/api`. The client attaches session and tenant context and handles the API's response envelope and refresh behavior. Keep authentication, tenant selection, errors and permission checks consistent with those shared helpers; do not make direct unauthenticated calls for protected resources.

The principal browser-visible setting is `NEXT_PUBLIC_API_URL`, which must be a URL safe to expose to users. Local development normally uses `http://localhost:8000/api/v1`; production points at the deployed API. Never put provider secrets or server-only credentials in `NEXT_PUBLIC_*` variables. Other available variables are listed in [`frontend/.env.example`](.env.example).

## Local development and checks

Provision backend dependencies as described in the [root local-development guide](../README.md#local-development), then:

```bash
npm ci
npm run dev
```

The frontend package provides:

```bash
npm run typecheck
npm run lint:check
npm test
npm run build
```

For lint auto-fixes use the explicitly named fix script if present in `package.json`; do not use auto-fix as a substitute for reviewing a diff. The production build may regenerate `.next` output and type files.

## UI and accessibility conventions

Use the existing brand tokens, layout/sidebar patterns, Radix/shared dialog components, accessible labels and focus states. Preserve responsive behavior and reduced-motion preferences. Reuse existing loading, empty, error and success patterns. A mock, disabled or unimplemented control must be labeled honestly rather than implying a successful backend operation.

The redesign notes under [`docs/redesign`](../docs/redesign/README.md) are dated design/verification records. They are not a promise that every route has been individually reviewed at every viewport.
