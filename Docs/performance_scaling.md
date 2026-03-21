# Performance & Scaling
Project: autopilot.monster.crm

---

## 1. Vertical vs. Horizontal Scaling
AutopilotMonster embraces "Horizontal Scaling" for the compute layer (API, Workers) and a combination of "Vertical + Read-Replica" scaling for the persistence layer (PostgreSQL).

---

## 2. Stateless API Layer
API containers (`apps/core`) are 100% stateless.
- They do not store local disk state.
- They do not maintain user sessions in memory.
- Therefore, they can be scaled from 1 container to 1,000 using standard `TargetTrackingScalingPolicies` based on CPU Utilization hitting > 70%.

---

## 3. Database Bottlenecks & Solutions

### 3.1 Connection Exhaustion
If the API scales to 100 instances, and each establishes a connection pool of 20, that results in an overwhelming 2,000 active connections to Postgres.
**Solution:** `PgBouncer` is implemented as a sidecar proxy. It maintains a constant small number of heavy database connections while accepting thousands of lightweight client connections from the API pods.

### 3.2 Read-Heavy Workloads
Dashboards, analytics, search, and list views account for 85% of traffic.
**Solution:** The primary `writer` DB endpoint is used only for `POST/PATCH/DELETE` operations. All `GET` requests (unless specifically demanding strict consistency) route to the Aurora `reader` endpoint, effortlessly distributing the load.

---

## 4. Frontend Optimization

- **React Profiling:** Next.js Server Components are heavily utilized to ship less Javascript to the client, greatly improving Time-To-Interactive (TTI) for heavy CRM tables.
- **SWR / React Query:** Data fetching happens eagerly. When a sales rep hovers over a Deal card, the system instantly pre-fetches the Deal Detail data from the API.
- **WebSocket Throttling:** Real-time push notifications over WebSockets are batched (e.g., 5 unread messages flash simultaneously instead of triggering 5 independent UI rerenders).
