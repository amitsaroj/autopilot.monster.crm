# Marketplace & App Ecosystem Design
Project: autopilot.monster.crm

---

## 1. Overview
The AutopilotMonster Marketplace allows third-party developers (and internal teams) to build, publish, and monetize integrations. Tenants can browse the marketplace and 1-click install apps to extend their CRM functionality.

---

## 2. Architecture

### 2.1 App Data Model
```typescript
@Entity('marketplace_apps')
export class MarketplaceApp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  developerId: string; // User/Tenant who created the app

  @Column()
  description: string;

  @Column('text', { array: true })
  scopes: string[]; // Requested OAuth scopes e.g. 'crm:read', 'workflow:write'

  @Column()
  clientId: string;

  @Column()
  clientSecretHash: string;

  @Column()
  redirectUri: string;

  @Column()
  webhookUrl: string;

  @Column({ default: 'DRAFT' })
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'DEPRECATED';

  @Column({ type: 'jsonb' })
  pricingModel: {
    type: 'FREE' | 'ONE_TIME' | 'MONTHLY_SUBSCRIPTION',
    amount?: number,
    currency?: string
  };
}
```

### 2.2 App Installation Flow (OAuth 2.0)
1. Tenant admin clicks "Install" in Marketplace UI.
2. Redirected to OAuth authorization screen `GET /oauth/authorize?client_id=...&scope=crm:read`.
3. Admin reviews requested permissions and clicks "Authorize".
4. System generates an OAuth Authorization Code, redirects to App's `redirect_uri`.
5. App exchanges Code for `access_token` and `refresh_token` via `POST /oauth/token`.
6. App is now recorded in `tenant_installations` table and can make API calls on behalf of the tenant.

---

## 3. Webhooks & Events
Installed apps can subscribe to CRM events via Webhooks.
- The app registers for events like `crm.contact.created`.
- When the event occurs, the internal Event Bus pushes the payload to the `webhooks` queue.
- A BullMQ worker POSTs the data to the App's `webhookUrl`.
- Retries: Exponential backoff up to 5 times. Failed webhooks disable the subscription temporarily until the developer fixes their endpoint.

---

## 4. UI Extensions (Plugins)
Marketplace Apps can inject UI components into the CRM.
- **Widgets:** Small iframe embedded in the Contact/Deal detail sidebar.
- **Custom Actions:** A custom button added to the Deal header (e.g., "Send to DocuSign") which triggers an App webhook or iframe modal.
- Configured via a `manifest.json` submitted when publishing the app.
