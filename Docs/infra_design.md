# Infrastructure & Deployment Design
Project: autopilot.monster.crm

---

## 1. General Infrastructure

AutopilotMonster is designed to run on managed Kubernetes (EKS / GKE) or a robust Docker Swarm / ECS cluster for high availability.

### 1.1 Core Components
- **API Gateway / Load Balancer:** NGINX or AWS ALB. Handles TLS termination, routing, and basic edge rate-limiting.
- **Compute:** ECS Fargate or EKS Pods. Auto-scaled based on CPU/Memory and Queue depth.
- **Database:** Amazon RDS for PostgreSQL (Multi-AZ, read replicas enabled).
- **Cache / Queues:** Amazon ElastiCache for Redis (Cluster mode).
- **Object Storage:** Amazon S3 (or MinIO if self-hosted).
- **Vector DB:** Qdrant Cloud (managed) or clustered Qdrant deployment.

---

## 2. CI/CD Pipeline
Code push to `main` triggers GitHub Actions:

1. **Lint & Test:** Runs Jest unit/e2e tests.
2. **Build Docker Images:**
   - `core-api:latest`
   - `auth-service:latest`
   - `ui-frontend:latest`
   - `worker-node:latest`
3. **Push to Registry:** AWS ECR or Docker Hub.
4. **Deploy:** Updates ECS Task Definitions or triggers ArgoCD to pull new manifests into the Kubernetes cluster.
5. **Database Migration:** An ephemeral job runs TypeORM migrations before traffic is routed to the new API pods.

---

## 3. Scalability Patterns

### 3.1 Scaling the API (Stateless)
- The NestJS API nodes and Next.js UI nodes are entirely stateless.
- Session state is in Redis.
- Horizontal Pod Autoscaler (HPA) adds instances when CPU > 70% or HTTP requests > 1000/sec.

### 3.2 Scaling Workers (Stateful Jobs)
- BullMQ worker pods are scaled based on **Queue Depth** rather than CPU.
- If `workflows` queue has > 100 pending jobs, scale out Worker pods to handle the burst.

### 3.3 Scaling the Database
- Heavy read operations (Analytics, Search) use a **Read Replica**.
- Connection pooling handled by **PgBouncer** sidecars to prevent exhausting Postgres connections when API pods scale out.
