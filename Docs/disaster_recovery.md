# Disaster Recovery Protocol
Project: autopilot.monster.crm

---

## 1. Overview
This doc explicitly covers procedural response to a catastrophic event, extending the technical architecture found in `ha_multi_region.md`.

## 2. Incident Tiers

| Tier | Description | Team Involved | Target Response Time | Target Resolution |
|---|---|---|---|---|
| **Sev-1** | Total system down, data loss occurring | SRE, DB Admins, VP Eng | < 5 mins | < 1 hour |
| **Sev-2** | Subsystem down (e.g., AI or Voice module fails) | Backend Engineers | < 15 mins | < 4 hours |
| **Sev-3** | UI glitch, non-critical latency | Frontend/QA | Next business day | Current Sprint |

## 3. Step-by-Step Recovery: Database Corruption

If a bad migration runs and corrupts the public schema across all tenants:
1. Identify immediate scope and halt API traffic (`MAINTENANCE MODE ON`).
2. Identify the exact timestamp of the destructive query.
3. Access AWS RDS console and initiate **Point-In-Time-Recovery (PITR)** to exactly 1 minute *before* the destructive query.
4. AWS spins up a completely new Database Cluster cloned from the logs.
5. SRE verifies data integrity in the new cluster.
6. Update application environment variables (`DATABASE_URL`) to point to the new cluster.
7. Restart API pods.
8. Disable maintenance mode.
9. Conduct Post-Mortem.

## 4. Step-by-Step Recovery: Complete Region Loss (us-east-1 goes dark)

1. Verify `us-east-1` is actually irrecoverable via AWS Health Dashboard.
2. Promote the `us-west-2` Aurora replica to standalone primary.
3. Update Route53 DNS for `api.autopilot.monster` to point to the `us-west-2` load balancer.
4. Since `us-east-1` ElastiCache might be lost, users will be logged out. They must re-authenticate against the `us-west-2` system.
5. Re-enable the system. Monitor load. RPO: minimal, RTO: 15-30m depending on manual DNS propagation.
