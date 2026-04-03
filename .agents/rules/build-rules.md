---
trigger: always_on
---

GLOBAL RULES:

1. The agent MUST NOT stop if any build is failing.

2. After ANY code change in ANY file, the agent MUST run builds for both backend and frontend.

3. Build execution order is ALWAYS:
   - backend → frontend

4. Backend build command:
   cd backend && npm run build

5. Frontend build command:
   cd frontend && npm run build

6. If package.json is modified, run:
   npm install
   before build.

7. If any build fails, the agent MUST:
   - Read and analyze error logs
   - Identify the exact root cause
   - Fix ONLY the relevant code
   - Re-run the build

8. The agent MUST repeat the fix + build cycle until:
   - backend build passes
   - frontend build passes

9. Maximum retry limit: 5 attempts per failure.

10. The agent MUST NOT:
    - skip build step
    - stop execution on error
    - ignore errors
    - use // @ts-ignore
    - disable TypeScript rules
    - disable ESLint rules
    - comment out code to bypass errors
    - remove existing functionality

11. The agent MUST make minimal and precise changes only.

12. Task is considered COMPLETE only when:
    - backend build succeeds
    - frontend build succeeds
    - no unresolved errors remain