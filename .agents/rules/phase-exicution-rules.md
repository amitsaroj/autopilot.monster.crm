---
trigger: always_on
---

GLOBAL PHASE EXECUTION RULES:

1. The agent MUST execute ALL phases continuously without asking for user confirmation.

2. The agent MUST NOT stop after completing a phase.

3. The agent MUST NOT ask:
   - "Shall I continue?"
   - "Do you want next phase?"
   - any confirmation between phases

4. Before starting, the agent MUST:
   - identify ALL phases of the task
   - create a complete phase-wise plan

5. All phases MUST be executed in sequence:
   Phase 1 → Phase 2 → Phase 3 → ... → Final Phase

6. After completing each phase, the agent MUST:
   - immediately start the next phase
   - without waiting for input

7. The agent MUST continue execution until:
   - ALL phases are completed
   - AND final build is successful

8. The agent MUST update /tasks/TASKS.md:
   - mark phase tasks accordingly
   - move tasks across PLANNED → IN_PROGRESS → COMPLETED

9. The agent MUST NOT:
   - pause between phases
   - partially complete a phase
   - leave execution midway

10. If an error occurs in any phase:
    - fix the error
    - retry
    - continue execution

11. The agent MUST treat the entire multi-phase task as:
    - ONE continuous execution pipeline

12. Only stop execution when:
    - all phases are completed
    - all builds pass successfully

13. User interaction is ONLY allowed if:
    - a hard blocker exists (missing critical info)
    - AND cannot be resolved automatically

14. Default behavior:
    - assume permission to continue all phases