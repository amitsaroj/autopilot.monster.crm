---
trigger: always_on
---

GLOBAL TASK MANAGEMENT RULES:

1. All tasks MUST be tracked in a single file:
   /tasks/TASKS.md

2. The agent MUST NOT create multiple task files.
   Only ONE file is allowed for all tasks.

3. File structure MUST always follow this format:

   ## PLANNED
   - [ ] Task title
     - id: TASK-001
     - description: short clear description
     - created_at: YYYY-MM-DD

   ## IN_PROGRESS
   - [ ] Task title
     - id: TASK-002
     - description: short clear description
     - started_at: YYYY-MM-DD

   ## COMPLETED
   - [x] Task title
     - id: TASK-003
     - description: short clear description
     - completed_at: YYYY-MM-DD

4. Every new task MUST be added under:
   ## PLANNED

5. When work starts on a task:
   - Move it from PLANNED → IN_PROGRESS
   - Add started_at

6. When task is finished:
   - Move it from IN_PROGRESS → COMPLETED
   - Mark checkbox [x]
   - Add completed_at

7. The agent MUST update TASKS.md:
   - BEFORE starting any task
   - AFTER completing any task

8. The agent MUST NOT:
   - duplicate tasks
   - change task IDs
   - delete completed tasks
   - create new tracking formats
   - create additional task files

9. Task IDs format MUST be incremental:
   TASK-001, TASK-002, TASK-003...

10. If TASKS.md does not exist:
    - Create /tasks directory
    - Create TASKS.md with empty sections

11. On every run, the agent MUST:
    - Read TASKS.md first
    - Understand current state
    - Continue from IN_PROGRESS if exists
    - Otherwise pick next task from PLANNED

12. Only ONE task can be in IN_PROGRESS at a time.

13. The agent MUST keep descriptions concise and technical.
    No vague or generic text.

14. The file MUST remain clean, readable, and consistent.
    No extra logs, comments, or debug text allowed.