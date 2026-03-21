# Analytics & Reporting Design
Project: autopilot.monster.crm

---

## 1. Overview
The Analytics module aggregates data across CRM, Billing, AI, Voice, and WhatsApp modules to provide rich operational insights for tenant admins and team managers.

---

## 2. Data Processing Strategy

To prevent heavy analytical queries from degrading transactional database performance, AutopilotMonster uses:
1. **Materialized Views:** For complex aggregations that update nightly.
2. **Read Replicas:** All reporting/analytics API calls are routed to a PostgreSQL read replica.
3. **Redis Aggregation:** Simple real-time counters (like daily calls) are incremented in Redis and flushed periodically.

---

## 3. Core Dashboards

### 3.1 CRM & Revenue Pipeline
- **Revenue Forecast:** Weighted deal calculations (`probability * value`) grouped by closing month.
- **Pipeline Funnel:** Deal conversion rates stage-by-stage. Drop-off percentages.
- **Win/Loss Analysis:** Sankey chart showing deals won vs. lost and reasons for loss.
- **Deal Velocity:** Average days to close, broken down by team/rep.

### 3.2 Team Performance Leaderboard
- Quota attainment tracking (Revenue goal vs. actual booked).
- Activity metrics (Cold calls made, emails sent, meetings booked).
- Average deal size won per sales rep.
- Win rate percentage per rep.

### 3.3 Voice & Channel Analytics
- Total incoming vs. outgoing call minutes.
- Call answer rates and average duration.
- WhatsApp message open and response rates.

### 3.4 Feature Usage & Cost Tracking (For Tenants)
- Visualizing token limits for AI usage.
- Billing projections based on current month consumption run-rate.

---

## 4. Custom Reports Builder

For Enterprise plans, an interactive Report Builder allows querying CRM data custom combinations:
- Filter entities (e.g., "Deals created last 30 days where Source = 'LinkedIn'")
- Group by (e.g., "Industry", "Owner")
- Aggregate (e.g., "Sum Deal Value", "Average Deal Size")

These reports run purely via SQL generation executed against the Read Replica.

---

## 5. Scheduled Reports Delivery

- Uses BullMQ `scheduler` queue.
- Users can configure reports (e.g., "Weekly Pipeline Summary") to be exported as PDF/CSV and emailed every Monday at 8 AM tenant time.
- Implementation: Puppeteer spins up headless Chrome, hits the hidden dashboard URL, generates PDF, attaches to Email service.
