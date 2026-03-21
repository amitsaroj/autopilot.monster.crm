# High Availability & Multi-Region
Project: autopilot.monster.crm

---

## 1. Overview
AutopilotMonster requires a 99.99% uptime SLA for Enterprise customers. A Multi-Region Architecture ensures survivability against complete AWS Availability Zone or Region failures.

---

## 2. Active-Passive Multi-Region (Current Phase)
The system currently implements a warm-standby architecture across `us-east-1` (Primary) and `us-west-2` (Disaster Recovery).

### 2.1 Database Replication
- **Amazon Aurora PostgreSQL:** Global database feature.
- `us-east-1` handles all read/write traffic.
- `us-west-2` maintains an asynchronous read replica with typical < 1s lag.

### 2.2 Redis Replication
- **Amazon ElastiCache Global Datastore:** Replicates session data, rate limits, and caching states across regions to ensure seamless failover without massive user logouts.

### 2.3 Storage (S3/MinIO)
- **Cross-Region Replication (CRR):** Source bucket (`us-east-1`) automatically and synchronously replicates all uploaded user documents, audio recordings, and exports to the destination bucket (`us-west-2`).

---

## 3. Failover Procedure

1. **Detection:** Route 53 Health Checks constantly ping the `us-east-1` API gateway.
2. **Alerting:** Upon 3 consecutive failures over 30 seconds, a critical PagerDuty alert is triggered.
3. **Database Promotion:** A manual (or scripted) process promotes the Aurora Replica in `us-west-2` to the Primary writer instance.
4. **DNS Switch:** Route 53 updates the weighted routing policy, pointing 100% of `api.autopilotmonster.com` traffic to the `us-west-2` API Gateway.
5. **Compute Spin Up:** Auto Scaling Groups in `us-west-2` instantly boot additional ECS tasks to handle the incoming load.

Target RTO (Recovery Time Objective): < 15 minutes.
Target RPO (Recovery Point Objective): < 5 minutes of data loss.
