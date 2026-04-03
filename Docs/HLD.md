# High Level Design (HLD)
Project: autopilot.monster.crm  
Type: Multi-tenant Enterprise CRM SaaS Platform  
Backend: NestJS  
Frontend: Next.js  
Database: PostgreSQL  
Cache / Queue: Redis + BullMQ  
Storage: MinIO  
Vector DB: Qdrant  
Architecture: Modular Microservice / Shared Core

---

## 1. Overview

AutopilotMonster CRM is a multi-tenant SaaS platform that provides:

- CRM
- AI automation
- Voice calling
- WhatsApp messaging
- Workflow engine
- Billing & subscription
- Marketplace & plugins
- Analytics
- Admin system

System must support:

- Multi tenant isolation
- Role based access
- Plan based features
- Usage billing
- High scalability
- Queue processing
- Event driven modules

---

## 2. System Architecture


UI (Next.js)
↓
API Gateway / Core (NestJS)
↓
Modules / Services
↓
Database / Cache / Queue / Storage


Apps structure:


apps/
core/
auth/
ui/


Modules inside core:


crm
billing
pricing
workflow
ai
voice
whatsapp
analytics
tenant
rbac
plugin
marketplace
notifications
storage
search
logs
metrics
scheduler


---

## 3. Multi-Tenant Model

Each request must include tenant context.

Tenant isolation rules:

- tenant_id column in every table
- tenant guard in backend
- tenant middleware in API
- tenant filter in repository

Types:

- super admin
- tenant admin
- user
- agent
- vendor

---

## 4. Authentication & Security

Auth handled by auth app.

Features:

- JWT
- refresh token
- session table
- RBAC
- permission matrix
- Multi-Factor Authentication (MFA/TOTP)
- Social Login (Google, GitHub, Facebook, Apple)
- tenant guard
- plan guard
- feature guard
- Zero Trust (Edge, API, DB layers)

Security layers:


Auth Guard
Tenant Guard
Role Guard
Permission Guard
Plan Guard
Limit Guard


---

## 5. Backend Architecture

Pattern:


Controller
Service
Repository
Entity
DTO
Guard
Interceptor
Filter


Shared core contains:

- database module
- cache module
- queue module
- event bus
- storage
- logger
- config

---

## 6. Database Design

Main DB: PostgreSQL

Tables groups:

- tenant
- users
- roles
- permissions
- subscription
- plans
- usage
- crm
- workflow
- messages
- calls
- ai
- logs

All tables include:


id
tenant_id
created_at
updated_at
deleted_at


---

## 7. Cache / Queue

Redis used for:

- cache
- rate limit
- queue
- sessions
- locks

BullMQ used for:

- workflow jobs
- call jobs
- ai jobs
- notification jobs
- retry jobs

---

## 8. Event Bus

Event driven communication:


user.created
deal.updated
workflow.run
call.finished
ai.completed
invoice.created
subscription.changed


Event bus module inside core.

---

## 9. Workflow Engine

Features:

- trigger
- condition
- action
- delay
- api call
- queue execution
- retry
- logs

Workflow runs in worker.

---

## 10. AI Engine

Features:

- chat
- agents
- memory
- vector search
- RAG
- prompt templates
- streaming
- usage tracking

Uses Qdrant + LLM.

---

## 11. Voice / WhatsApp

Voice:

- call campaign
- IVR
- recording
- transcription
- queue

WhatsApp:

- numbers
- templates
- inbox
- broadcast
- flow builder

---

## 12. Billing & Pricing

Supports:

- plans
- credits
- usage billing
- limits
- feature flags
- subscription
- invoice
- payment

Every request must check:


plan
feature
limit
usage


---

## 13. Frontend

Next.js App Router

Sections:


dashboard
crm (Contacts, Companies, Deals, Pipelines)
billing (Plans, Invoices, Usage)
workflow (Automations, Logs)
ai (Chat, Agents, Knowledge Base)
voice (Calls, Transcripts, Campaigns)
whatsapp (Inbox, Flow Builder, Broadcast)
analytics (Business Intelligence)
admin (SuperAdmin Control Center)
settings (Tenant, User, Workspace)
logs (Audit, System)
marketplace (Plugins, Extensions)
storage (Cloud Assets)


Layout:


auth layout
app layout
admin layout


---

## 14. Admin Panel

Super admin can:

- manage tenants
- manage plans
- manage limits
- manage features
- manage plugins
- view logs
- view metrics
- control usage

---

## 15. High Availability

Design supports:

- multi instance
- redis cluster
- db replica
- queue workers
- stateless api

---

## 16. Backup & Recovery

- DB backup
- storage backup
- config backup
- tenant export
- restore

---

## 17. Monitoring

- logs
- metrics
- health check
- queue monitor
- usage monitor

---

## 18. Goals

System must be:

- scalable
- secure
- modular
- multi-tenant
- extensible
- production ready