# Cost Model & COGS Analysis
Project: autopilot.monster.crm

---

## 1. Overview
This outlines the Cost of Goods Sold (COGS) for operating AutopilotMonster CRM, detailing the external vendor costs per feature.

---

## 2. Vendor Cost Breakdown

### 2.1 AI Engine (OpenAI)
| Model | Input Cost | Output Cost | Average Cost per Chat Exchange |
|---|---|---|---|
| `gpt-4o-mini` | $0.150 / 1M tokens | $0.600 / 1M tokens | ~$0.0003 |
| `gpt-4o` | $2.50 / 1M tokens | $10.00 / 1M tokens | ~$0.005 |
| `text-embedding-3-small`| $0.02 / 1M tokens | N/A | ~$0.00002 per doc |

*Markup Strategy:* We mark up AI costs by approx. **4x** to cover infrastructure overhead (Qdrant, Redis, Queue).

### 2.2 Voice Engine (Twilio)
- **Local Numbers:** $1.15 / month per number
- **Outbound Minutes:** ~$0.014 / minute (US)
- **Inbound Minutes:** ~$0.0085 / minute (US)
- **Recording:** $0.0025 / minute
- **Transcription (Whisper via OpenAI):** $0.006 / minute

*Markup Strategy:* We charge flat $0.02/minute outbound + $0.01/min transcription, yielding a **~25% margin**.

### 2.3 WhatsApp (Meta Cloud API)
- **Business Initiated (Marketing):** ~$0.0143 per conversation (US)
- **Business Initiated (Utility):** ~$0.0044 per conversation (US)
- **User Initiated (Service):** ~$0.0088 per conversation (US)

*Markup Strategy:* We charge flat $0.015 per message sent to simplify billing, yielding mixed margins but predictable customer pricing.

### 2.4 Email (AWS SES / SendGrid)
- **AWS SES:** $0.10 per 1,000 emails.

*Markup Strategy:* We charge $0.50 per 1,000, yielding **5x margin**.

---

## 3. Fixed Infrastructure Costs Base

For a standard cluster (10,000 active users):
- **EKS Compute (Fargate/EC2):** ~$600/mo
- **RDS PostgreSQL (db.r6g.xlarge Multi-AZ):** ~$800/mo
- **ElastiCache Redis:** ~$200/mo
- **MinIO/S3 Storage (10 TB):** ~$230/mo
- **Qdrant Cloud:** ~$150/mo
- **Total Fixed Baseline:** ~$1,980/month

With 1,000 paid generic users at $49/mo ($49,000 MRR), the infrastructure COGS is ~4%, leaving 96% Gross Margin (before metered vendor costs + salaries).
