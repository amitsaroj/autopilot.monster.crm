# /dev — TeammateTool Multi-Agent Dev Pipeline

You are the team lead orchestrator. A feature request has arrived.
Spin up a full agent team and execute the complete pipeline using TeammateTool.

**Feature Request:** $ARGUMENTS

---

## BRIEFING — Understand the Task (RUNS FIRST, ALWAYS)

Before a single model is queried, ensure the feature request is fully understood.

```javascript
Task({
  name: "briefing",
  subagent_type: "briefing",
  prompt: `
    You are the briefing agent. The user wants to build: $ARGUMENTS

    Read CLAUDE.md and package.json first.
    Then ask the user targeted clarifying questions about scope, constraints,
    acceptance criteria, timeline, and edge cases — all in ONE message.
    Save the final FEATURE BRIEF to FEATURE_BRIEF.md.
    Report back when the brief is saved.
  `
})
```

**Wait** for the brief to be saved before continuing.
**If the user says GO** without answering: proceed with reasonable assumptions documented in the brief.

---

## MODEL ROUTER — Detect Available AI Models (FIRST GATE, RUNS BEFORE EVERYTHING)

Run this as the very first step. It determines what models are available and sets the pipeline strategy.

```javascript
Task({
  name: "model-router",
  subagent_type: "model-router",
  prompt: `
    You are the model-router agent.
    Feature about to be built: $ARGUMENTS

    Detect all available AI models in priority order:
    Claude → OpenAI → Cursor → Custom endpoint → Ollama

    Report the strategy and whether to continue or stop.
    If BLOCKED (nothing available), output setup instructions and stop.
  `
})
```

**If BLOCKED:** Present setup instructions and STOP.
**If OLLAMA_ONLY:** Output the mandatory Ollama warnings, then continue with extra human checkpoint emphasis.
**If any other strategy:** Continue to PREFLIGHT.

---

## PREFLIGHT — Environment & Repo Health Check (BLOCKING GATE)

Run this BEFORE creating the team or the branch. If it fails, stop entirely.

```javascript
Task({
  name: "preflight",
  subagent_type: "preflight",
  prompt: `
    You are the preflight agent.
    Feature about to be built: $ARGUMENTS

    Run all pre-flight checks: git repo state, Node/npm versions,
    Docker daemon, required services (PostgreSQL, Redis, Qdrant),
    .env file presence, baseline build, and baseline tests.

    Report OVERALL: READY or BLOCKED.
  `
})
```

**If BLOCKED:** Present all blockers to the human and STOP. Do not create team or branch.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 PREFLIGHT FAILED — PIPELINE CANNOT START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[paste preflight blockers with fix commands]

Fix the blockers above, then re-run /dev $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If READY:** Continue to Stage 0.

---

## STAGE 0 — Setup Team + Create Feature Branch

Derive a kebab-case slug from the feature name (e.g. "Add WhatsApp webhook" → `whatsapp-webhook`).

```javascript
// Create feature branch BEFORE any code is written
Bash(`git checkout -b feat/<kebab-slug>`)

// Create pipeline state directory and start watchdog in background
Bash(`mkdir -p .pipeline-state/current && echo "" > .pipeline-state/current/watchdog.log`)

// Start watchdog — runs silently in background for the entire pipeline duration
Task({
  team_name: "dev-pipeline",
  name: "watchdog",
  subagent_type: "watchdog",
  run_in_background: true,
  prompt: `
    You are the watchdog agent on team dev-pipeline.
    Monitor all agents throughout this pipeline run.
    WATCHDOG_INTERVAL: ${process.env.WATCHDOG_INTERVAL || 600} seconds.
    Pipeline state dir: .pipeline-state/current/
    Start monitoring immediately and run until you see .pipeline-state/current/pipeline.done
  `
})

// Create the team
Teammate({
  operation: "spawnTeam",
  team_name: "dev-pipeline",
  description: "Feature: $ARGUMENTS"
})

// Create the shared task list
TaskCreate({ team_name: "dev-pipeline", subject: "BRIEF: Gather requirements and acceptance criteria", status: "complete", owner: "briefing" })
TaskCreate({ team_name: "dev-pipeline", subject: "MODELS: Detect available models and set strategy", status: "complete", owner: "model-router" })
TaskCreate({ team_name: "dev-pipeline", subject: "PREFLIGHT: Validate environment and repo health", status: "complete", owner: "preflight" })
TaskCreate({ team_name: "dev-pipeline", subject: "THINK: Analyze feature and produce plan", status: "pending", owner: "thinker" })
TaskCreate({ team_name: "dev-pipeline", subject: "RESEARCH: Investigate third-party needs from plan", status: "pending", owner: "researcher", blockedBy: [] })
TaskCreate({ team_name: "dev-pipeline", subject: "CODE: Implement thinker plan with researcher findings", status: "pending", owner: "coder", blockedBy: ["THINK", "RESEARCH"] })
TaskCreate({ team_name: "dev-pipeline", subject: "BUILD: TypeScript compilation + Docker config validation", status: "pending", owner: "build-validator", blockedBy: ["CODE"] })
TaskCreate({ team_name: "dev-pipeline", subject: "DOCS: Add missing Swagger decorators and JSDoc", status: "pending", owner: "docs-writer", blockedBy: ["CODE"] })
TaskCreate({ team_name: "dev-pipeline", subject: "AUDIT: Code quality review", status: "pending", owner: "auditor", blockedBy: ["BUILD", "DOCS"] })
TaskCreate({ team_name: "dev-pipeline", subject: "SECURITY: Security vulnerability audit", status: "pending", owner: "security-sentinel", blockedBy: ["BUILD"] })
TaskCreate({ team_name: "dev-pipeline", subject: "DB: Migration generation and validation", status: "pending", owner: "db-migrator", blockedBy: ["BUILD"] })
TaskCreate({ team_name: "dev-pipeline", subject: "DEPS: npm audit and license check", status: "pending", owner: "dependency-auditor", blockedBy: ["BUILD"] })
TaskCreate({ team_name: "dev-pipeline", subject: "REVIEW: Final go/no-go verification", status: "pending", owner: "reviewer", blockedBy: ["AUDIT", "SECURITY", "DB", "DEPS"] })
TaskCreate({ team_name: "dev-pipeline", subject: "COMMIT: Write structured commit message", status: "pending", owner: "commit-writer", blockedBy: ["REVIEW"] })
TaskCreate({ team_name: "dev-pipeline", subject: "CHANGELOG: Update CHANGELOG.md and bump version", status: "pending", owner: "changelog", blockedBy: ["REVIEW"] })
TaskCreate({ team_name: "dev-pipeline", subject: "PR: Write GitHub pull request description", status: "pending", owner: "pr-writer", blockedBy: ["REVIEW"] })
```

---

## STAGE 1 — Spawn Thinker + Researcher in PARALLEL

Send BOTH Task calls in a single message to trigger parallel execution:

```javascript
Task({
  team_name: "dev-pipeline",
  name: "thinker",
  subagent_type: "thinker",
  run_in_background: true,
  prompt: `
    You are the thinker agent on team dev-pipeline.
    Your name is thinker. Read CLAUDE.md first.

    Feature request: $ARGUMENTS

    Produce a complete implementation plan following your output format.
    When done, send your plan to team-lead inbox and update task status to complete.
  `
})

Task({
  team_name: "dev-pipeline",
  name: "researcher",
  subagent_type: "researcher",
  run_in_background: true,
  prompt: `
    You are the researcher agent on team dev-pipeline.
    Your name is researcher.

    Feature request: $ARGUMENTS

    The thinker is working in parallel. While they plan, you pre-research common
    third-party needs for this type of feature in a NestJS/Next.js/PostgreSQL stack.

    When you receive the thinker's specific research questions via inbox, prioritize those.
    When done, send your research report to team-lead inbox and update task status to complete.
  `
})
```

**Wait** for both thinker and researcher to send findings to team-lead inbox.

After receiving both:
- Forward thinker's research questions to researcher if not already answered
- Wait for researcher's final report

---

## ⛔ HUMAN CHECKPOINT — Plan Approval (NEVER SKIP)

Present the plan to the human before a single line of code is written:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PLAN READY — REVIEW BEFORE CODING STARTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: $ARGUMENTS
Branch: feat/<slug>

📐 THINKER PLAN:
[paste full thinker output]

🔬 RESEARCHER FINDINGS:
[paste full researcher output]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 YOUR ACTION:
  Reply APPROVE to start coding.
  Or describe any changes you want made to the plan first.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**DO NOT spawn the coder until the human replies APPROVE (or equivalent).**
If the human requests plan changes, revise accordingly and re-present before proceeding.

---

## STAGE 2 — Spawn Coder (only after human approval)

```javascript
Task({
  team_name: "dev-pipeline",
  name: "coder",
  subagent_type: "coder",
  run_in_background: true,
  prompt: `
    You are the coder agent on team dev-pipeline.
    Your name is coder.

    THINKER PLAN:
    [paste full thinker output here]

    RESEARCHER FINDINGS:
    [paste full researcher output here]

    Implement the plan exactly. Follow your agent instructions.
    When done, send your implementation report to team-lead inbox.
    Update your task to complete.
  `
})
```

**Wait** for coder to send implementation report.

---

## STAGE 2.5 — Spawn Build-Validator + Docs-Writer in PARALLEL (fast-fail gate)

Send BOTH in a single message immediately after coder reports:

```javascript
Task({
  team_name: "dev-pipeline",
  name: "build-validator",
  subagent_type: "build-validator",
  run_in_background: true,
  prompt: `
    You are the build-validator agent on team dev-pipeline.
    Your name is build-validator.

    The coder just finished implementing: $ARGUMENTS

    CODER REPORT:
    [paste coder's full implementation report]

    Run tsc --noEmit, npm run build, circular dep check, Docker Compose config validation.
    Send your build report to team-lead inbox when done.
    Update your task to complete.
  `
})

Task({
  team_name: "dev-pipeline",
  name: "docs-writer",
  subagent_type: "docs-writer",
  run_in_background: true,
  prompt: `
    You are the docs-writer agent on team dev-pipeline.
    Your name is docs-writer.

    FILES CHANGED:
    [paste file list from coder's implementation report]

    Add missing Swagger decorators (@ApiTags, @ApiOperation, @ApiResponse, @ApiProperty)
    and JSDoc to any public service methods that are missing them.
    Update .env.example with descriptions for any new variables.
    Send your docs report to team-lead inbox when done.
    Update your task to complete.
  `
})
```

**Wait** for both to send reports.

### If build-validator reports FAIL:
Send the build errors back to coder immediately — do NOT spawn audit agents yet:

```javascript
Teammate({
  operation: "sendMessage",
  team_name: "dev-pipeline",
  to: "coder",
  message: {
    type: "build_fix_request",
    build_errors: [/* paste build-validator FAIL items */],
    instruction: "Fix ALL build errors listed. Run npm run build and tsc --noEmit locally before reporting back."
  }
})
```

Repeat until build-validator reports PASS, then continue to Stage 3.

---

## STAGE 3 — Spawn Auditor + Security-Sentinel + DB-Migrator + Dependency-Auditor in PARALLEL

Only run after build-validator reports PASS. Send ALL FOUR in a single message:

```javascript
Task({
  team_name: "dev-pipeline",
  name: "auditor",
  subagent_type: "auditor",
  run_in_background: true,
  prompt: `
    You are the auditor agent on team dev-pipeline.
    Your name is auditor.

    FEATURE REQUIREMENT: $ARGUMENTS

    CODER REPORT:
    [paste coder's full implementation report]

    DOCS REPORT:
    [paste docs-writer's report]

    FILES TO AUDIT:
    [paste file list from coder's implementation report]

    Run lint, unit tests with coverage, and e2e tests.
    Audit for quality, correctness, performance, integration test coverage, and Docker/env config completeness.
    Send your audit report to team-lead inbox when done.
    Update your task to complete.
  `
})

Task({
  team_name: "dev-pipeline",
  name: "security-sentinel",
  subagent_type: "security-sentinel",
  run_in_background: true,
  prompt: `
    You are the security-sentinel agent on team dev-pipeline.
    Your name is security-sentinel.

    FEATURE REQUIREMENT: $ARGUMENTS

    FILES TO AUDIT:
    [paste file list from coder's implementation report]

    Run security checks. Audit for vulnerabilities, auth issues, data exposure.
    Send your security report to team-lead inbox when done.
    Update your task to complete.
  `
})

Task({
  team_name: "dev-pipeline",
  name: "db-migrator",
  subagent_type: "db-migrator",
  run_in_background: true,
  prompt: `
    You are the db-migrator agent on team dev-pipeline.
    Your name is db-migrator.

    FEATURE REQUIREMENT: $ARGUMENTS

    CODER REPORT:
    [paste coder's full implementation report]

    Review entity/model changes. Generate migration if coder did not.
    Check reversibility, data safety, and index coverage.
    Send your migration report to team-lead inbox when done.
    Update your task to complete.
  `
})

Task({
  team_name: "dev-pipeline",
  name: "dependency-auditor",
  subagent_type: "dependency-auditor",
  run_in_background: true,
  prompt: `
    You are the dependency-auditor agent on team dev-pipeline.
    Your name is dependency-auditor.

    FEATURE REQUIREMENT: $ARGUMENTS

    Run npm audit, check outdated packages, verify license compliance,
    and flag phantom or duplicate dependencies.
    Send your dependency audit report to team-lead inbox when done.
    Update your task to complete.
  `
})
```

**Wait** for all four to send reports.

---

## STAGE 4 — Fix Loop (max 3 retries, then escalate)

Initialize counter:
```
fixAttempts = 0
MAX_FIX_ATTEMPTS = 3
```

**While** auditor, security-sentinel, db-migrator, or dependency-auditor report CRITICAL issues **AND** `fixAttempts < MAX_FIX_ATTEMPTS`:

```javascript
fixAttempts++

Teammate({
  operation: "sendMessage",
  team_name: "dev-pipeline",
  to: "coder",
  message: {
    type: "fix_request",
    attempt: fixAttempts,
    max_attempts: MAX_FIX_ATTEMPTS,
    critical_issues: [
      // paste ALL CRITICAL issues from all four audit reports
    ],
    instruction: "Fix ALL critical issues listed. Re-run lint, tests, and e2e tests after fixing. Report back when done."
  }
})
```

After coder reports back, re-run auditor, security-sentinel, db-migrator, and dependency-auditor on changed files only.
Repeat until no CRITICAL issues remain OR `fixAttempts >= MAX_FIX_ATTEMPTS`.

### If MAX_FIX_ATTEMPTS reached with unresolved CRITICALs — ESCALATE TO HUMAN:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 PIPELINE BLOCKED — 3 FIX ATTEMPTS FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The coder could not resolve all critical issues in 3 attempts.

Unresolved CRITICAL issues:
[list each with source agent, file:line, issue, and what was tried]

Your options:
  FIX    — describe a specific approach for the coder to try
  SKIP <issue-id> — accept the risk and bypass a specific issue
  ABORT  — stop the pipeline (branch stays as-is for manual work)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**STOP and wait for human response before proceeding.**

---

## STAGE 5 — Spawn Reviewer

```javascript
Task({
  team_name: "dev-pipeline",
  name: "reviewer",
  subagent_type: "reviewer",
  run_in_background: true,
  prompt: `
    You are the reviewer agent on team dev-pipeline.
    Your name is reviewer.

    ORIGINAL FEATURE: $ARGUMENTS

    BUILD REPORT:
    [paste build-validator report]

    AUDITOR REPORT:
    [paste auditor report]

    SECURITY REPORT:
    [paste security-sentinel report]

    DB MIGRATION REPORT:
    [paste db-migrator report]

    DEPENDENCY AUDIT REPORT:
    [paste dependency-auditor report]

    Run lint, tests, and build yourself. Verify all CRITICALs are resolved.
    Issue GO or NO-GO. Send decision to team-lead inbox.
    Update your task to complete.
  `
})
```

**Wait** for reviewer decision.
If NO-GO: repeat Stage 4 fix loop (counter resets), then re-spawn reviewer.

---

## STAGE 6 — Post-GO: Commit Message + Changelog + PR Description in PARALLEL

Only run after reviewer issues GO. Send ALL THREE in a single message:

```javascript
Task({
  team_name: "dev-pipeline",
  name: "commit-writer",
  subagent_type: "commit-writer",
  run_in_background: true,
  prompt: `
    You are the commit-writer agent on team dev-pipeline.
    The reviewer has issued a GO signal.

    Run: git status, git diff --stat, git diff, git ls-files --others --exclude-standard, git log --oneline -5
    Note: files are NOT yet staged — use git diff, not git diff --staged.
    Write a complete structured commit message following your format.
    Output the commit message only — nothing else.
  `
})

Task({
  team_name: "dev-pipeline",
  name: "changelog",
  subagent_type: "changelog",
  run_in_background: true,
  prompt: `
    You are the changelog agent on team dev-pipeline.
    The reviewer has issued a GO signal.

    Feature implemented: $ARGUMENTS

    Read CHANGELOG.md (or create if missing), read current package.json version,
    and read git log --oneline -10 for context.
    Determine the semver bump level. Update CHANGELOG.md and package.json version.
    Report back when done.
  `
})

Task({
  team_name: "dev-pipeline",
  name: "pr-writer",
  subagent_type: "pr-writer",
  run_in_background: true,
  prompt: `
    You are the pr-writer agent on team dev-pipeline.
    The reviewer has issued a GO signal.

    FEATURE: $ARGUMENTS
    BRANCH: feat/<slug>

    CODER REPORT:
    [paste coder's implementation report]

    AUDITOR SUMMARY:
    [paste auditor summary section]

    SECURITY SUMMARY:
    [paste security-sentinel summary section]

    DB MIGRATION SUMMARY:
    [paste db-migrator summary section]

    DEPENDENCY AUDIT SUMMARY:
    [paste dependency-auditor overall status]

    Write a complete GitHub pull request description following your format.
    Output only the PR description — nothing else.
  `
})
```

**Wait** for all three to complete.

---

## STAGE 7 — Present to Human

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PIPELINE COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: $ARGUMENTS
Branch: feat/<slug>

📋 Files Changed:
[list from coder report]

🏗️  Build: PASS — [TypeScript: clean, Docker Compose: valid]

🧪 Tests: X unit tests, Y e2e tests — all passing

📄 Docs: [from docs-writer — X decorators added, Y JSDoc entries]

🗄️  DB Migrations: [from db-migrator report — files and safety status]

📦 Dependencies: [from dependency-auditor — X CVEs, license status]

🔍 Audit Summary:
- Quality: [auditor summary]
- Security: [security-sentinel summary]

✅ Reviewer: GO

📝 COMMIT MESSAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[paste commit message]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CHANGELOG: [version bump — e.g. 1.2.0 → 1.3.0 (minor)]

📄 PR DESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[paste pr description]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 YOUR ACTION — review the above, then run:

  git add .
  git commit -m "<first line of commit message>"
  git push -u origin feat/<slug>
  gh pr create --title "<pr title>" --body "<pr description>"
```

---

## STAGE 8 — Cleanup Team

```javascript
// Signal watchdog to shut down
Bash(`echo "done" > .pipeline-state/current/pipeline.done`)

Teammate({ operation: "cleanup", team_name: "dev-pipeline" })
```

---

## Parallel Execution Map

```
Feature Request
      │
   briefing (ask user: scope, constraints, acceptance criteria → FEATURE_BRIEF.md)
      │
   model-router (detect Claude/OpenAI/Cursor/Ollama → set strategy)
      │
   preflight (blocking gate — stop if FAIL)
      │
   watchdog spawned in background ──────────────────────────────────── (monitors all agents every N min)
      │
      ├─── thinker ──────────────────────────────────┐
      │                                              ▼
      └─── researcher (pre-research) ──────── MERGE PLANS
                                                     │
                                          ⛔ HUMAN CHECKPOINT
                                            (approve plan)
                                                     │
                                                  coder
                                                     │
                                    ┌────────────────┤
                                    ▼                ▼
                            build-validator     docs-writer
                                    │   (fast-fail gate)
                                    │  if FAIL → back to coder
                                    │
          ┌─────────────────────────┼──────────────────────┐
          ▼                         ▼            ▼          ▼
       auditor          security-sentinel   db-migrator  dependency-auditor
          └─────────────────────────┴────────────┴──────────┘
                                    │   (fix loop ×3 max)
                                 reviewer
                                    │
           ┌────────────────────────┼────────────────────┐
           ▼                        ▼                     ▼
    commit-writer             changelog               pr-writer
           └────────────────────────┴─────────────────────┘
                                    │
                            HUMAN REVIEW → PUSH
```
