# Repository Guidelines

## Project Structure & Module Organization

- `backend/src/` contains the NestJS API: domain features in `modules/`, shared guards and utilities in `common/`, and TypeORM entities/migrations in `database/`. Integration tests live in `backend/test/integration/`, with helpers in `backend/test/e2e/`.
- `frontend/src/` contains the Next.js App Router (`app/`), reusable `components/`, `hooks/`, API `services/`, and utilities in `lib/`. Static assets live in `frontend/public/`.
- `Docs/` holds architecture, feature, and audit documentation. Root Compose and Terraform files, `nginx/`, and `.github/workflows/` define infrastructure and automation.

## Build, Test, and Development Commands

Use Node.js 20 (matching CI). Run `npm ci` separately in `backend/` and `frontend/`; each has its own lockfile.

- From the root, `docker compose up -d postgres redis minio qdrant` starts supporting services.
- In either application directory, `npm run dev` starts development mode; `npm run build` creates the production build; `npm test` runs unit tests.
- In `backend/`, `npm run typecheck` checks TypeScript, `npm run test:cov` collects coverage, and `npm run test:integration` runs integration tests serially.
- In `frontend/`, `npm run test:watch` starts interactive Vitest.

Prefer scripts in the current package manifests over stale README command names or legacy workspace scripts.

## Coding Style & Naming Conventions

Use TypeScript and follow neighboring code. Root Prettier settings specify two spaces, single quotes, semicolons, trailing commas, and a 100-character print width. Use PascalCase for classes/components and camelCase for functions/variables. Follow Nest filenames such as `analytics.service.ts` and Next.js route conventions such as `page.tsx`.

ESLint scripts exist in both packages; backend `npm run lint` modifies files, while `npm run lint:check` is read-only. Backend `npm run format` applies Prettier.

## Testing Guidelines

Backend tests use Jest/ts-jest: `*.spec.ts` for unit tests and `*.integration.spec.ts` for integration tests. Frontend tests use Vitest with jsdom and `*.test.ts(x)` or `*.spec.ts(x)` under `src/`. No numeric coverage threshold is configured. Add regression tests for behavior changes, especially tenant isolation and authorization; run affected tests and builds before submitting.

## Commit & Pull Request Guidelines

Follow existing scoped Conventional Commits, for example `fix(voice): handle failed calls` or `feat(ai): add provider adapter`. Keep changes focused. PRs should explain the problem, resulting behavior, validation commands/results, and configuration or migration impacts. Link relevant issues and include screenshots for UI changes.

## Security & Configuration

Copy checked-in environment examples for local configuration and keep credentials out of Git. Export backend environment variables before starting the API. Preserve tenant scoping and permission checks when modifying data access.
