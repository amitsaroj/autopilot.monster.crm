# UI Pricing Rules & Enforcement
Project: autopilot.monster.crm

---

## 1. Component Level Gating
The frontend uses a custom React Hook `useFeature()` to evaluate capabilities locally based on the JWT/Context payload.

```tsx
function AutomationsView() {
  const { hasFeature, showUpsellModal } = useFeature();

  if (!hasFeature('workflow_engine')) {
    return (
      <div className="locked-state">
        <LockIcon />
        <h2>Workflows require the Pro Plan</h2>
        <button onClick={() => showUpsellModal('workflow')}>Upgrade Now</button>
      </div>
    );
  }

  return <WorkflowBuilder />;
}
```

## 2. Form Limit Gating
When a user is filling out a form, we proactively check counts.
- E.g., A user on the Starter plan tries to invite a 6th team member.
- The `TeamMembers` page pulls the limit context: `max_users = 5`, `current_users = 5`.
- The Next.js UI physically disables the "Invite User" button and replaces the tooltip with "Limit Reached: Add more seats".
- *Defense in depth:* If they hack the browser and submit the POST, the `LimitGuard` on the backend immediately rejects it with a 402.

## 3. Upsell Funnel
Every locked feature maps to a standard `UpsellModal` component, which clearly explains the ROI of the blocked feature and outlines the prorated cost of upgrading immediately.
