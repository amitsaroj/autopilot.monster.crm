# Autopilot Monster redesign

The existing Next.js 16 / React 19 frontend now uses a light default theme with navy text, cool surfaces, and blue, cyan, and teal brand accents. Existing dark-theme switching remains available. The route inventory contains 352 pages; it distinguishes shared styling and direct source changes from actual browser verification. It does not claim that every protected route was visually verified.

## Branding and design foundation

The root contains `AutopilotMonster Gradient AI Logo.png` and `AutopilotMonster Logo Showcase.png`. No separate production symbol, square icon, transparent wordmark, or monochrome files were found. `frontend/public/brand/autopilot-monster.png` preserves the supplied full-logo image. The shared BrandLogo displays regions of that original artwork for navigation and compact presentations; the showcase is not used as an application logo. The supplied PNG is also the metadata icon and social-image fallback. Dedicated icon and vector variants remain desirable.

The selected tokens are navy `#0B1538`, blue `#155EEF`, cyan `#00D9F5`, teal `#00E6B8`, primary text `#111B3A`, cool background `#F5F8FF`, surface `#EEF3FC`, secondary text `#667085`, and border `#E4EAF4`. Cyan and teal are restrained decorative accents; filled controls use darker colors for readable labels. Global CSS and Tailwind retain the existing architecture and centralize surfaces, focus rings, elevation, motion, radii, and reusable component classes.

## Implementation

- Rebuilt the homepage around existing capabilities, with a layered CSS perspective composition and functional route links.
- Applied shared colors, typography, surfaces, and responsive rules across public, CRM, AI, communications, analytics, marketplace, billing, builder, admin, sub-admin, and superadmin screens.
- Updated public and application branding, collapsed sidebar presentation, navigation labels, real header destinations, active states, and mobile keyboard handling.
- Made contacts a readable table with existing search, pagination, editing, and deletion handlers. Connected the previously static new-contact form to the existing service.
- Replaced simulated onboarding outcomes with shared workspace settings, API-backed role invitations, and the existing billing plan picker. Invitation requests use the existing backend roleId contract.
- Connected workflow creation to the existing action palette and draft-save service. The canvas validates a single action sequence to match the existing executor. Configuration currently uses JSON.
- Connected the voice builder draft-save button to the existing flow service and replaced palette emoji with Lucide icons.
- Added an accessible shared Radix dialog, branded route loading state, labels on authentication fields, reduced-motion support, and responsive table/dialog bounds.
- Removed blanket hide-until-mounted rendering so server-rendered content appears immediately. No new dependency or heavy 3D renderer was added.
- Corrected public proxy access for supplied branding, integrations, help, status, testimonials, robots, and sitemap routes. Existing protected-route role checks remain in place.
- Fixed documentation self-links and the previously inactive public contact form; its action opens an email draft rather than claiming a message was sent.

## API configuration

The frontend now uses `https://api.autopilots.monster/api/v1`, deriving the base from the supplied login URL. The local frontend environment, default API configuration, example environment, OAuth destinations, and Next API rewrite agree on that base. No local backend was started. Login has a 20-second timeout and a persistent error that distinguishes connectivity failures from credential failures.

## Verification

- Production build completed successfully, including TypeScript and 305 generated static pages.
- Standalone TypeScript checking passed after correcting a duplicate status-button attribute introduced during the accessibility pass. Existing Vitest globals are included in TypeScript configuration.
- Existing frontend tests passed: 4 files, 7 tests. No new test cases were added.
- Both staged and unstaged diff whitespace checks passed.
- The lint command could not run because the repository lacks an ESLint flat configuration. Trying the installed Next configuration exposed an ESLint/parser incompatibility; that attempted configuration was removed and dependencies were not upgraded.
- Homepage and pricing were checked at 320, 375, 768, 1024, 1440, and 1920 pixels. Login was checked at those widths; measured overflow came from browser-extension autofill elements, not application layout.
- Additional public pages were inspected at 320 pixels. Recorded route-level results are in `route-inventory.json`; unverified routes remain explicitly identified.
- Demo credentials were inspected on the existing demo page and tried through the real application login. The supplied remote API did not complete successfully from this environment; the UI displayed the connectivity error and re-enabled the form. An earlier external connectivity check timed out after 15 seconds.
- Raw browser network inspection was declined; it was not retried or replaced with an indirect diagnostic workaround.

## Remaining limitations

Authenticated screen rendering, API-backed CRUD, admin permissions, billing checkout, and live workflow execution could not be verified without a reachable remote API and successful session. These checks remain required before release. Existing marketing content outside the rebuilt homepage was largely retained and was not independently substantiated. Some routes inherit the foundation rather than a bespoke page-layout rewrite. Dedicated logo variants, full protected-route visual verification, and the repository's lint configuration remain unfinished.

Important implementation files include `src/app/globals.css`, `tailwind.config.ts`, `components/brand-logo.tsx`, `components/layout/*`, `components/marketing/pages/HomePageContent.tsx`, `components/settings/team-invite-form.tsx`, `components/settings/workspace-settings.tsx`, `components/billing/plan-picker.tsx`, `components/ui/dialog-shell.tsx`, `app/(app)/workflows/builder/page.tsx`, `components/FlowBuilder/FlowBuilder.tsx`, `lib/env.config.ts`, and `proxy.ts`, all under `frontend`.
