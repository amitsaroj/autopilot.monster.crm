# Local Docker and UI verification — 13 October 2026

> Historical report for the specific local environment and commit exercised on this date. Its dependency versions, route counts, test totals, deployment observations and open issues are not current-state assertions. Consult [current implementation status](../implementation-status.md) and rerun the relevant checks before release.

The backend runs at `http://localhost:8000/api/v1`. The development frontend runs at `http://localhost:3100`; the production build used for browser verification runs at `http://localhost:3101`. The ignored frontend `.env.local` points to the local API. The repository's production API default remains `https://api.autopilots.monster/api/v1`.

Docker project `autopilot-ui-check` has its own PostgreSQL, Redis, MinIO, and Qdrant volumes. All four dependencies and the API readiness endpoint reported healthy. Redis is published on port 6380 because the host already has a Redis service on 6379. The local API is bound to loopback and the local Compose file explicitly selects the bundled database and development mode.

The supplied MinIO image could not be pulled from Docker Hub; Quay rejected its image too. `docker/minio/Dockerfile` builds the official release `RELEASE.2025-04-22T22-12-26Z` at commit `0d7408fc9969caf07de6a8c3a84f9fbb10a6739e`. Both its source download and complete Docker build succeeded. The running storage service uses this image.

Data came from the repository's existing seed scripts: six users, four companies, eight contacts, six deals, one pipeline, and five tasks. Verification added a contact named **Local UI verification** and an inactive manual-trigger workflow named **Local UI verification draft**. The contact's job title and inline notes were saved and confirmed by a fresh API read. The workflow draft was saved through the tenant-admin UI. These records remain available for inspection.

## Browser coverage

The route inventory has 352 route patterns: 295 static and 57 dynamic. All 295 static destinations were opened. Another 37 dynamic patterns were checked using available records, including all six linked blog articles: 337 distinct URLs in total. Superadmin, tenant-admin, and delegated sub-admin screens were checked using their supplied demo personas.

Checks covered initial rendering, loading completion where available, errors, navigation destinations, and overflow. They do not establish that every control or business action on every screen has been exercised. The inventory records the scope and remaining prerequisites per route.

- Final retests passed for activities, team users, invitations, role screens, storage, documents, contact/deal file tabs, admin deal lists, inbox fallback, and public status.
- Contact creation and update, workflow draft saving, login redirects, sign-out navigation, and deal status filtering were exercised through the local application.
- Homepage, contacts, deals, workflow builder, billing, and the admin overview were checked at 320, 375, 768, 1024, 1440, and 1920 pixels. Their final checks found no document or main-panel overflow. Deal-board scrolling stays inside its own container.
- Mobile navigation opening, Escape dismissal, and focus return were checked. Closed mobile navigation is hidden from keyboard and accessibility navigation.
- `/settings/security`, `/admin/ai/settings`, `/admin/marketplace`, `/admin/settings/backup`, `/admin/settings/notifications`, and `/admin/whatsapp/profiles` returned 403 under the tested API role/feature configuration. Their authorization was preserved; their configuration still needs review.
- MFA without a pending challenge redirects to login. Email verification without a token displays its failure state. OAuth callbacks were checked only without provider tokens.

## Fixes

Shared response parsing now handles nested response envelopes and paginated record lists. RBAC and storage services provide their callers with consistent lists. Team screens tolerate missing role assignments and display unavailable role information explicitly. The role matrix reads role details and uses the existing validated update endpoint for custom-role permission changes; system-role editing remains disabled.

Activities use the API's `subject` and `occurredAt` fields. Paginated deal queries sort by the TypeORM entity property, preventing the joined-query metadata error. Admin deal rows accept the returned stage relation object. Task titles and high-priority labels use readable theme colors, and task actions have accessible names and remain visible on touch screens.

Contact updates submit writable fields rather than sending tenant IDs and audit metadata from GET responses. The existing inline notes field is now an optional validated string in the contact DTO. This is an additive request-contract change for an existing entity field; tenant and audit fields remain rejected.

Login navigates to the role's home page after success. Sign-out clears the session and navigates away from protected content. Inbox feature rejection remains local so its existing WhatsApp fallback can run. Public status and the admin health panel read actual API health results. Deal filters and the New Deal destination work; board/list controls are labeled. Mobile controls wrap, and admin navigation cards defer their four-column layout until wider screens.

## Verification commands

| Command | Result |
| --- | --- |
| Backend `npm test -- --runInBand --passWithNoTests` | 22 suites, 110 tests passed after the backend fixes |
| Frontend `npm test` | 8 files, 37 tests passed |
| Frontend `npx tsc --noEmit` | Passed |
| Frontend production build | Passed, including TypeScript and 305 generated static pages; final sidebar build also passed |
| Docker builds for API and MinIO | Passed |
| `docker compose ... config --quiet` | Passed |
| `/api/v1/health/ready` | HTTP 200; database, Redis, Qdrant, and MinIO up |
| Paginated `/crm/deals?page=1&limit=20` | HTTP 200, six records |
| Frontend `npm run lint` | Blocked by the pre-existing missing ESLint flat configuration |
| `git diff --check` | Passed before commit |

No new test cases were added. An initial fresh-database migration attempt failed because a migration referenced a voice enum before its baseline existed. The isolated local database was initialized from the existing entity schema and then seeded. Production migrations were not modified.

## Reproducing the local stack

Use a local `backend/.env` with development credentials. Build and start the infrastructure:

```bash
REDIS_PORT=6380 docker compose -p autopilot-ui-check build api minio
REDIS_PORT=6380 docker compose -p autopilot-ui-check up -d postgres redis minio qdrant
```

For a fresh isolated local database, initialize its entity schema, seed it, and start the API:

```bash
REDIS_PORT=6380 docker compose -p autopilot-ui-check run --rm --no-deps api node -e 'const {AppDataSource}=require("./dist/database/data-source"); AppDataSource.initialize().then(async()=>{await AppDataSource.synchronize(); await AppDataSource.destroy();}).catch(()=>process.exit(1))'
REDIS_PORT=6380 docker compose -p autopilot-ui-check run --rm --no-deps api npm run seed:prod
REDIS_PORT=6380 docker compose -p autopilot-ui-check up -d api
```

Set the ignored frontend `.env.local` API URL to `http://localhost:8000/api/v1`, then use the existing frontend scripts. The supplied tenant admin is `admin@autopilotmonster.com`; its password is the existing demo password published on `/demo`.

## Remaining verification

Twenty dynamic patterns lack the required local records, provider activity, execution IDs, or share tokens. Real payment checkout, outbound calls/messages, AI inference, configured OAuth/MFA flows, invitation delivery, and destructive actions were not executed. Existing unfinished controls and provider-specific behavior need further interaction coverage before release.

The pipeline fix is in PR #30. Its first backend/frontend GitHub CI checks passed. Deployment previously failed at AWS login with an invalid security token. AWS secret timestamps remained unchanged at the last check, and deployment has not been revalidated. Production Compose still references the unavailable prebuilt MinIO image; the source-build replacement in this change applies to local Compose.
