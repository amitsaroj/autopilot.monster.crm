# QA Batch 4: AI & RAG Engine
Project: autopilot.monster.crm

---

- [ ] Upload 5MB PDF to Knowledge Base; Verify Qdrant indexing matches 500-token chunks.
- [ ] Ask Agent question outside Knowledge Base (Verify Fallback strategy executes).
- [ ] Check streaming response (`text/event-stream`) visually chunks text smoothly to UI.
- [ ] Test Tool Calls (Ask AI "Create a deal for Acme Corp"; Verify DB Deal created).
- [ ] Trigger Human Handoff (Verify Agent stops, email sent to Rep).
