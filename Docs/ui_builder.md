# UI Builder Design
Project: autopilot.monster.crm

---

## 1. Overview
The UI Builder module allows Tenant Admins to create custom internal tools, public forms, landing pages, and customer portals using a drag-and-drop interface, without writing code.

---

## 2. Builder Architecture

### 2.1 Storage & Rendering
UI pages are heavily schema-driven. The drag-and-drop editor produces a JSON schema representing the layout and data bindings.

```typescript
// Schema stored in `builder_pages` table
{
  "id": "page-uuid",
  "name": "Lead Intake Form",
  "isPublic": true,
  "layout": [
    {
      "type": "Container",
      "styles": { "padding": "2rem", "background": "#ffffff" },
      "children": [
        { "type": "Heading", "text": "Contact Sales" },
        { 
          "type": "Form", 
          "bindEntity": "crm.contact",
          "action": "CREATE",
          "fields": [
            { "name": "firstName", "type": "text", "required": true },
            { "name": "email", "type": "email", "required": true },
            { "name": "company", "type": "text" }
          ],
          "onSubmit": [
            { "action": "SHOW_TOAST", "message": "Thank you!" },
            { "action": "TRIGGER_WORKFLOW", "workflowId": "uuid" }
          ]
        }
      ]
    }
  ]
}
```

### 2.2 Frontend Engine
The Next.js frontend has a dynamic recursive renderer `<BuilderEngine schema={page.layout} />` that maps JSON nodes to React components.

---

## 3. Data Binding & Permissions
- **Public Pages:** Forms that create records (e.g. Lead capture). Uses a restricted public API endpoint that only permits inserting data based on the form schema.
- **Internal Tools:** Pages built for logged-in CRM users (e.g. a custom Deal management dashboard).
  - Component queries are executed using the logged-in user's JWT.
  - Role Guards still apply: If an internal tool tries to load `billing` data, and the user's role lacks `billing:read`, the component fails gracefully.

---

## 4. Workflows Integration
Forms built in the UI Builder seamlessly integrate with the Workflow Engine.
When a form submits, it emits a `builder.form.submitted` event containing the form payload. Workflows triggered on this event can then parse the payload to send emails, score the lead, or assign a sales rep.
