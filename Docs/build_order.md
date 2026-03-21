# Build & Deployment Order
Project: autopilot.monster.crm

---

## 1. Local Development Setup

To initialize the project from a fresh clone:

1. **Install dependencies:**  
   `npm install` (using modern npm workspaces or Yarn berry).

2. **Spin up Infrastructure:**  
   `docker-compose up -d postgres redis minio`

3. **Run Migrations:**  
   `npm run build:libs`  
   `npx typeorm migration:run -d libs/database/src/data-source.ts`

4. **Seed the Database:** (Creates default plans and super admin)  
   `npm run seed`

5. **Start Dev Server:**  
   `npm run dev` (Concurrently starts `apps/core` and `apps/ui`).

---

## 2. CI/CD Build Sequence (Production)

To ensure zero-downtime and safe schema execution, the production CD pipeline executes exactly in this order:

1. `npm ci`
2. `npm run test:all`
3. `npm run build:api`
4. `npm run build:ui`
5. `npm run build:worker`
6. Build and tag Docker images.
7. Push to ECR.
8. **CRITICAL:** Start a stand-alone ephemeral Task running `typeorm migration:run`.
9. Once migrations succeed, trigger ECS zero-downtime rolling update for `worker` pods.
10. Trigger ECS zero-downtime rolling update for `api` pods.
11. Vercel automatically deploys the `ui` Next.js artifacts.
12. Run Post-deployment E2E Smoketests.
