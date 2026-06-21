# Project Config — Autopilot Dev Pipeline

## Stack
NestJS · Next.js · PostgreSQL · Redis · Docker · Qdrant

## Agent Orchestration Rules

**ALWAYS use TeammateTool swarm patterns** when given a new feature or task.
Never run planning, coding, auditing, and reviewing in a single session.
Always spawn a team. Always use parallel execution where tasks are independent.

### Pipeline Stages (run in this order)
0a. **briefing** — ask user for scope, constraints, acceptance criteria, timeline → FEATURE_BRIEF.md
0b. **model-router** — detect available AI models, set strategy (Claude → OpenAI → Cursor → Ollama)
0c. **preflight** — blocking env + repo health check before team is created
0d. **watchdog** — spawned in background at Stage 0; monitors all agents every N minutes (default 10)
1. **thinker + researcher** — plan + research in parallel
2. ⛔ **HUMAN CHECKPOINT** — approve plan before any code is written
3. **coder** — implements the plan
4. **build-validator + docs-writer** — fast-fail gate: TypeScript build + Swagger docs (parallel)
5. **auditor + security-sentinel + db-migrator + dependency-auditor** — full parallel audit
6. **fix loop** — coder fixes CRITICALs (max 3 retries, then escalate to human)
7. **reviewer** — final go/no-go
8. **commit-writer + changelog + pr-writer** — parallel post-GO tasks
9. ⛔ **HUMAN REVIEW** — human pushes manually

### Coordination Rules
- Briefing runs first — all other stages receive FEATURE_BRIEF.md
- Watchdog runs in background for entire pipeline duration, checks every $WATCHDOG_INTERVAL seconds (default 600)
- Thinker and researcher run **in parallel**
- build-validator and docs-writer run **in parallel** after coder
- Auditor, security-sentinel, db-migrator, and dependency-auditor run **in parallel** — only after build passes
- If build fails: coder fixes build errors BEFORE audit stage runs
- Reviewer runs **after** all four auditors complete
- Fix loop max retries: **3** — escalate to human if still unresolved
- commit-writer, changelog, and pr-writer run **in parallel** after GO signal

### Code Standards
- SOLID principles, clean architecture
- All new code must have unit tests (Jest)
- All new API endpoints must have integration tests (supertest + test DB)
- No hardcoded secrets — always env vars
- New env vars must be added to `.env.example`
- Typed errors, structured logging
- All public APIs must be documented

### Human Checkpoints (NEVER skip)
1. After thinker + researcher: review and approve plan before coder starts
2. After max fix retries: decide FIX / SKIP / ABORT
3. After pipeline completes: review commit message, CHANGELOG, and PR description before pushing
- Human runs: `git add . && git commit -m "..." && git push && gh pr create ...`
- Never auto-push

## Model Priority Chain

Agents try models in this order — use the **first available**:

```
1. Claude (Anthropic)    → ANTHROPIC_API_KEY set
2. OpenAI / Codex        → OPENAI_API_KEY set
3. Cursor                → CURSOR_API_KEY or ~/.cursor/config.json
4. Custom endpoint       → OPENAI_BASE_URL set to non-default URL
5. Ollama (local, free)  → http://localhost:11434 reachable
```

Run `bash scripts/check-models.sh` to see what's available on your machine.

**If only Ollama is available:** Use `bash scripts/ollama-pipeline.sh "feature"` instead of `/dev`.
All generated code must be reviewed by a human before committing in Ollama-only mode.

See `model-config.md` for per-agent model assignments and anti-hallucination rules.

## Always use swarm orchestration patterns (TeamCreate, Task with team_name, SendMessage, TaskCreate/TaskUpdate) when work is best executed by parallel specialist agents.
