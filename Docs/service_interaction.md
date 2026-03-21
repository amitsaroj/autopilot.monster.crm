# Service Interaction & Integration Patterns
Project: autopilot.monster.crm

---

## 1. Internal Boundaries
AutopilotMonster enforces strict Domain-Driven Design (DDD). Modules **cannot** directly import the repository level of another module.

**BAD:** `BillingService` directly imports `DealRepository` to count deals.
**GOOD:** `BillingService` imports `CrmModule`'s exported `DealService.countTenantDeals(id)`.

## 2. Synchronous REST vs Asynchronous Events
- Use Synchronous DI (Dependency Injection) Services if the requesting module *needs the return value immediately* to complete its transaction. 
  - E.g., The API Gateway needs JWT validation from `AuthService` before allowing access.
- Use Asynchronous Events if the action is a *side effect*.
  - E.g., When `UserService` creates a new user, it fires `user.created`. The `BillingService` listens and increments the active user count in Redis. `UserService` does not wait or care if the count succeeds instantly.

## 3. Handling Circular Dependencies
If Module A needs Module B, and Module B needs Module A, NestJS throws a `CircularDependencyException`.
Using `forwardRef()` is a code smell. The preferred architecture solution is:
1. Shift the shared logic into a common underlying module.
2. Abstract the action entirely behind the Event Bus.
