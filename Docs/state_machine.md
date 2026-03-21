# state_machine.md

AutopilotMonster Infrastructure Documentation

Architecture rules:

- NestJS modular backend
- PostgreSQL primary DB
- Redis cache + queue
- MinIO storage
- Qdrant vector DB
- Event bus based communication
- Worker queue processing
- Scheduler jobs
- Retry strategy
- Multi-tenant isolation
- RBAC
- Feature flags
- Rate limits
- Audit logs
- HA ready
