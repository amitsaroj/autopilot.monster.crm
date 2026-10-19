# Known limitations and external dependencies

Snapshot 2026-10-16. These are known from repository inspection; this is not an exhaustive guarantee that no other defects exist.

- **Meta:** no authorized business account/app credentials were available. Embedded Signup, scope grant, callback reachability, template approval, provider rate policy and real token expiry/recovery remain unverified. Only official Cloud API paths should be enabled.
- **Production configuration:** Compose has unsafe fallback DB/Redis/MinIO credentials and optional environment-file configuration. Existing deployed state may depend on them; changing credentials requires coordinated owner-controlled rotation, not a blind source-only password change.
- **Deployment:** the GitHub workflow applies Terraform and deploys on `main`; it uses mutable tags and does not gate production on the complete check suite. No deploy was run. The product domain and workflow hostnames also need owner confirmation.
- **Database/SRE:** no local PostgreSQL, clean migration rehearsal, backup restore, alert paging or measured capacity evidence was available. API image lacks the PostgreSQL client tools expected by some backup procedures.
- **Billing:** Stripe is the implemented platform billing path. Razorpay/PayPal and connected-customer payment processing are not verified implementations. Marketplace purchase/vendor settlement and reported revenue require completion; do not use estimates as actual sales.
- **Workflow:** generic scheduler target execution and reliable source-event recovery have defects; multi-replica semantics have not been exercised.
- **AI:** configured provider selection is incomplete, tenant key cache rotation and quota reservation need correction, KB deletion can leave vectors, and some dashboard metrics are static. AI costs are not universally measured.
- **CRM:** import can partially persist, CSV round-trip is not robust for quoted/newline fields, and a deal stage may be inconsistent with its pipeline. Tag/segment API coverage is incomplete.
- **Frontend/product:** a source audit found static admin metrics/inert controls, onboarding routing gaps, fixed public prices disconnected from plan selection, and a premium listing lacking customer checkout. No full browser verification was performed.
- **Dependency risk:** frontend production audit was cleared by non-force updates at one point; backend and development dependency advisories remain. Registry results change over time. Nest packages must stay version-compatible.
- **Scope:** no production deployment, live message, customer billing, destructive migration, history rewrite, or secret rotation was authorized or performed.
