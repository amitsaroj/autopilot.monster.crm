#!/usr/bin/env bash
# ollama-pipeline.sh — Complete dev pipeline using Ollama local models
# For users without Claude/OpenAI access.
#
# Usage:
#   bash scripts/ollama-pipeline.sh "Add WhatsApp webhook"
#   bash scripts/ollama-pipeline.sh --resume .pipeline-state/2026-06-12T10-30/
#   bash scripts/ollama-pipeline.sh --models          (list available models)
#
# Requirements:
#   - Ollama running: ollama serve
#   - Models pulled: see model-config.md for recommendations
#   - Project: NestJS/Next.js/PostgreSQL/Redis/Docker

set -euo pipefail

# ── Config ───────────────────────────────────────────────────────────────────
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
STATE_DIR=".pipeline-state/$(date +%Y-%m-%dT%H-%M-%S)"
RESUME_DIR=""
FEATURE_REQUEST=""

# Model assignments (override with env vars)
MODEL_REASON="${OLLAMA_MODEL_REASON:-llama3.1:70b}"       # thinker, reviewer
MODEL_CODE="${OLLAMA_MODEL_CODE:-deepseek-coder-v2:16b}"  # coder, db-migrator
MODEL_ANALYSIS="${OLLAMA_MODEL_ANALYSIS:-llama3.1:70b}"   # auditor, security
MODEL_LIGHT="${OLLAMA_MODEL_LIGHT:-llama3.1:8b}"          # docs, commit, changelog, pr
MODEL_FAST="${OLLAMA_MODEL_FAST:-llama3.1:8b}"            # preflight, build-validator

# Colors
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

# ── Argument parsing ──────────────────────────────────────────────────────────
NON_INTERACTIVE=false
AUTO_PUSH=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --models)
      curl -sf "$OLLAMA_HOST/api/tags" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print('Available Ollama models:')
for m in d.get('models',[]): print(f'  {m[\"name\"]} ({round(m.get(\"size\",0)/1e9,1)}GB)')
"
      exit 0
      ;;
    --resume)
      RESUME_DIR="${2:-}"
      [ -z "$RESUME_DIR" ] && { echo "Usage: --resume <state-dir>"; exit 1; }
      [ ! -d "$RESUME_DIR" ] && { echo "State dir not found: $RESUME_DIR"; exit 1; }
      STATE_DIR="$RESUME_DIR"
      FEATURE_REQUEST=$(cat "$RESUME_DIR/feature-request.txt" 2>/dev/null || echo "")
      echo -e "${YELLOW}Resuming from: $RESUME_DIR${NC}"
      shift 2
      ;;
    --auto|-y|--non-interactive)
      NON_INTERACTIVE=true
      AUTO_PUSH=true
      shift
      ;;
    -*)
      echo "Unknown option: $1"
      echo "Usage: bash scripts/ollama-pipeline.sh [--auto] [--resume <dir>] [--models] [\"feature request\"]"
      exit 1
      ;;
    *)
      FEATURE_REQUEST="$1"
      shift
      ;;
  esac
done

if [ -z "$FEATURE_REQUEST" ]; then
  echo "Usage: bash scripts/ollama-pipeline.sh [--auto] \"your feature request\""
  echo "       bash scripts/ollama-pipeline.sh --resume .pipeline-state/<dir>"
  echo "       bash scripts/ollama-pipeline.sh --models"
  exit 1
fi

# ── Helpers ───────────────────────────────────────────────────────────────────
log() { echo -e "${CYAN}[pipeline]${NC} $*"; }
stage() { echo ""; echo -e "${BOLD}${BLUE}━━━ $* ━━━${NC}"; echo ""; }
ok() { echo -e "${GREEN}✅ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $*${NC}"; }
fail() { echo -e "${RED}❌ $*${NC}"; }
ask() { echo -e "${YELLOW}👤 $*${NC}"; }

# Save a pipeline state file
save_state() {
  local name="$1"
  local content="$2"
  mkdir -p "$STATE_DIR"
  echo "$content" > "$STATE_DIR/${name}.md"
  log "Saved: $STATE_DIR/${name}.md"
}

# Check if a stage was already completed (for resume)
already_done() {
  local name="$1"
  [ -f "$STATE_DIR/${name}.md" ] && [ -s "$STATE_DIR/${name}.md" ]
}

# Call Ollama — core function with anti-hallucination settings
ollama_call() {
  local model="$1"
  local system_prompt="$2"
  local user_prompt="$3"
  local max_tokens="${4:-4096}"

  # Escape for JSON
  local sys_escaped
  sys_escaped=$(echo "$system_prompt" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo "\"$system_prompt\"")
  local user_escaped
  user_escaped=$(echo "$user_prompt" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo "\"$user_prompt\"")

  local response
  response=$(curl -sf "$OLLAMA_HOST/api/chat" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"$model\",
      \"messages\": [
        {\"role\": \"system\", \"content\": $sys_escaped},
        {\"role\": \"user\", \"content\": $user_escaped}
      ],
      \"stream\": false,
      \"options\": {
        \"temperature\": 0,
        \"top_p\": 0.9,
        \"num_predict\": $max_tokens,
        \"repeat_penalty\": 1.1
      }
    }" 2>/dev/null) || { fail "Ollama call failed for model: $model"; return 1; }

  echo "$response" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d['message']['content'])
except Exception as e:
    print(f'ERROR parsing response: {e}', file=sys.stderr)
    sys.exit(1)
"
}

# Verify a model is available
check_model() {
  local model="$1"
  if curl -sf "$OLLAMA_HOST/api/tags" | grep -q "\"$model\"" 2>/dev/null; then
    return 0
  else
    warn "Model '$model' not found. Falling back to llama3.1:8b"
    echo "llama3.1:8b"
    return 1
  fi
}

# Read project files for grounding (anti-hallucination)
get_project_context() {
  local context=""
  # Package info
  if [ -f "package.json" ]; then
    context+="## package.json\n$(cat package.json | head -60)\n\n"
  fi
  # Project structure
  context+="## Project structure\n$(find src -type f -name "*.ts" 2>/dev/null | grep -v ".spec." | head -40 | sort)\n\n"
  # CLAUDE.md
  if [ -f "CLAUDE.md" ]; then
    context+="## CLAUDE.md\n$(cat CLAUDE.md)\n\n"
  fi
  echo -e "$context"
}

# ── Check Ollama is running ───────────────────────────────────────────────────
if ! curl -sf "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; then
  fail "Ollama is not running at $OLLAMA_HOST"
  echo ""
  echo "Start it with: ollama serve"
  echo "Install it with: curl -fsSL https://ollama.com/install.sh | sh"
  exit 1
fi

ok "Ollama is running at $OLLAMA_HOST"
log "Feature: $FEATURE_REQUEST"
log "State dir: $STATE_DIR"
mkdir -p "$STATE_DIR"
echo "$FEATURE_REQUEST" > "$STATE_DIR/feature-request.txt"

# ── PREFLIGHT ────────────────────────────────────────────────────────────────
stage "PREFLIGHT — Environment Check"

PREFLIGHT_ISSUES=()

# Node
if ! command -v node &>/dev/null; then
  PREFLIGHT_ISSUES+=("Node.js not found — install from https://nodejs.org")
else
  ok "Node.js: $(node --version)"
fi

# npm deps
if [ ! -d "node_modules" ]; then
  PREFLIGHT_ISSUES+=("node_modules not found — run: npm install")
else
  ok "node_modules: present"
fi

# Git state
GIT_STATUS=$(git status --short 2>/dev/null | wc -l)
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
ok "Git branch: $GIT_BRANCH"
if [ "$GIT_STATUS" -gt 0 ] && [[ "$GIT_BRANCH" =~ ^(main|master|develop)$ ]]; then
  PREFLIGHT_ISSUES+=("Uncommitted changes on protected branch '$GIT_BRANCH' — commit or stash first")
fi

# Baseline build
log "Checking baseline build..."
if npm run build > /tmp/baseline-build.log 2>&1; then
  ok "Baseline build: PASS"
else
  PREFLIGHT_ISSUES+=("Baseline build FAILS before feature starts — fix it first:\n$(tail -10 /tmp/baseline-build.log)")
fi

if [ ${#PREFLIGHT_ISSUES[@]} -gt 0 ]; then
  fail "PREFLIGHT FAILED — fix these issues first:"
  for issue in "${PREFLIGHT_ISSUES[@]}"; do echo "  • $issue"; done
  exit 1
fi
ok "Preflight: all checks passed"

# ── STAGE 0: FEATURE BRANCH ──────────────────────────────────────────────────
stage "STAGE 0 — Create Feature Branch"

SLUG=$(echo "$FEATURE_REQUEST" | tr '[:upper:]' '[:lower:]' | \
       sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | cut -c1-40 | sed 's/-*$//')
BRANCH="feat/$SLUG"

if git branch --list "$BRANCH" | grep -q "$BRANCH"; then
  warn "Branch $BRANCH already exists — switching to it"
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
  ok "Created branch: $BRANCH"
fi

# ── STAGE 1: THINKER ─────────────────────────────────────────────────────────
stage "STAGE 1 — Thinker (Architecture Plan)"

if already_done "thinker"; then
  ok "Thinker: already completed (resuming)"
  THINKER_OUTPUT=$(cat "$STATE_DIR/thinker.md")
else
  log "Running thinker with model: $MODEL_REASON"
  PROJECT_CONTEXT=$(get_project_context)

  THINKER_OUTPUT=$(ollama_call "$MODEL_REASON" \
"You are a principal software architect. Plan only — never write code.
Read the project context carefully. Only reference files and patterns that actually exist.
Output MUST follow the exact format below. Do not add sections not in the format." \
"Project context:
$PROJECT_CONTEXT

Feature request: $FEATURE_REQUEST

Produce a complete implementation plan in this EXACT format:

## PLAN: [feature name]

### Affected Files
- list existing files that change (only files visible in project structure above)

### New Files
- list new files to create with their paths

### Data Models
- define any new TypeScript interfaces/entities

### API Contracts
- endpoint: METHOD /path — request body — response shape

### Implementation Tasks
1. [T1] Task — independent: yes/no — blocked by: none or [T-id]
2. [T2] Task — independent: yes/no — blocked by: [T1]

### Research Needed
- list any packages to research (check they exist in npm first)

### Risks & Edge Cases
- list potential failure points

### Estimated Complexity
- LOW / MEDIUM / HIGH — reason" 6000)

  save_state "thinker" "$THINKER_OUTPUT"
fi

echo "$THINKER_OUTPUT" | head -30
echo "..."
ok "Thinker complete"

# ── STAGE 1: RESEARCHER ──────────────────────────────────────────────────────
stage "STAGE 1 — Researcher (Library Research)"

if already_done "researcher"; then
  ok "Researcher: already completed (resuming)"
  RESEARCHER_OUTPUT=$(cat "$STATE_DIR/researcher.md")
else
  log "Running researcher with model: $MODEL_LIGHT"

  # Extract research questions from thinker output
  RESEARCH_NEEDED=$(echo "$THINKER_OUTPUT" | grep -A 20 "### Research Needed" | head -20)

  RESEARCHER_OUTPUT=$(ollama_call "$MODEL_LIGHT" \
"You are a technical researcher. Research only — never implement.
CRITICAL: Only recommend packages that you are certain exist on npm.
If unsure, say 'verify with: npm info <package-name>'.
Never invent package names." \
"Feature: $FEATURE_REQUEST

Research needed (from thinker):
$RESEARCH_NEEDED

For each item: recommend a package, give the npm install command, and a 3-line usage example.
Format each as:
### [Question]
**Package:** name@version
**Install:** npm install name
**Usage:**
\`\`\`typescript
// minimal example
\`\`\`
**Verify exists:** npm info name version" 3000)

  # Anti-hallucination: verify each recommended package exists
  log "Verifying recommended packages exist..."
  VERIFIED_OUTPUT="$RESEARCHER_OUTPUT"
  while IFS= read -r line; do
    if [[ "$line" =~ \*\*Package:\*\*[[:space:]]([a-z@/][a-zA-Z0-9@/_.-]+) ]]; then
      PKG="${BASH_REMATCH[1]%%@*}"
      if npm info "$PKG" version > /dev/null 2>&1; then
        ok "  Package verified: $PKG"
      else
        warn "  Package '$PKG' NOT FOUND on npm — flagging in output"
        VERIFIED_OUTPUT="${VERIFIED_OUTPUT//**Package:** $PKG/**Package:** ⚠️ UNVERIFIED: $PKG (run: npm info $PKG)}"
      fi
    fi
  done <<< "$RESEARCHER_OUTPUT"

  save_state "researcher" "$VERIFIED_OUTPUT"
  RESEARCHER_OUTPUT="$VERIFIED_OUTPUT"
fi

ok "Researcher complete"

# ── HUMAN CHECKPOINT: PLAN APPROVAL ─────────────────────────────────────────
stage "⛔ HUMAN CHECKPOINT — Plan Approval"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}📋 PLAN READY — REVIEW BEFORE CODING STARTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$THINKER_OUTPUT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if $NON_INTERACTIVE; then
  HUMAN_DECISION="approve"
  echo "Non-interactive mode: Automatically approving the plan."
else
  ask "Review the plan above. Type APPROVE to start coding, or describe changes:"
  read -r HUMAN_DECISION
fi

if [[ "${HUMAN_DECISION,,}" != "approve" ]] && [[ "${HUMAN_DECISION,,}" != "yes" ]] && [[ "${HUMAN_DECISION,,}" != "y" ]]; then
  warn "Plan not approved. Changes requested: $HUMAN_DECISION"
  warn "Update the plan in $STATE_DIR/thinker.md and re-run with --resume $STATE_DIR"
  # Remove thinker state to force re-run
  rm -f "$STATE_DIR/thinker.md"
  exit 0
fi
ok "Plan approved — starting coder"

# ── STAGE 2: CODER ───────────────────────────────────────────────────────────
stage "STAGE 2 — Coder (Implementation)"

if already_done "coder-report"; then
  ok "Coder: already completed (resuming)"
  CODER_REPORT=$(cat "$STATE_DIR/coder-report.md")
else
  log "Running coder with model: $MODEL_CODE"
  log "Anti-hallucination: temperature=0, file-grounded, compile-verified"

  PROJECT_CONTEXT=$(get_project_context)

  # Get implementation tasks from thinker
  IMPL_TASKS=$(echo "$THINKER_OUTPUT" | grep -A 30 "### Implementation Tasks" | head -30)
  NEW_FILES=$(echo "$THINKER_OUTPUT" | grep -A 10 "### New Files" | head -10)

  CODER_OUTPUT=$(ollama_call "$MODEL_CODE" \
"You are a senior full-stack TypeScript engineer.
CRITICAL RULES:
1. Only import from packages that are in package.json or are Node built-ins
2. Only reference files/classes that exist in the project structure provided
3. Generate ONE file at a time, complete and compilable
4. Use strict TypeScript — no 'any' type unless absolutely necessary
5. Follow NestJS patterns exactly as seen in existing code
6. Every new service method must have a unit test" \
"Project context:
$PROJECT_CONTEXT

Thinker plan:
$THINKER_OUTPUT

Researcher findings:
$RESEARCHER_OUTPUT

TASK: Implement the plan. For each file to create/modify:
1. Show the COMPLETE file content (no truncation)
2. State which existing patterns you're following
3. List every import and verify it exists

Format each file as:
### FILE: path/to/file.ts
\`\`\`typescript
// complete file content
\`\`\`

After all files, write:
## IMPLEMENTATION REPORT
### Files Created: list
### Files Modified: list
### Tests Written: list
### Packages Added: list (run npm install for these)" 8000)

  save_state "coder-output" "$CODER_OUTPUT"

  # Extract and write files
  log "Writing generated files..."
  FILES_WRITTEN=()
  while IFS= read -r line; do
    if [[ "$line" =~ ^###\ FILE:\ (.+)$ ]]; then
      CURRENT_FILE="${BASH_REMATCH[1]}"
      mkdir -p "$(dirname "$CURRENT_FILE")"
      # Content extraction would need full parsing — save for manual review
      FILES_WRITTEN+=("$CURRENT_FILE")
    fi
  done <<< "$CODER_OUTPUT"

  warn "⚠️  IMPORTANT: Local model generated code needs verification!"
  warn "Review the output in $STATE_DIR/coder-output.md before applying files."
  echo ""
  echo "Files to create/modify:"
  echo "$CODER_OUTPUT" | grep "^### FILE:" | sed 's/### FILE: /  /'

  if $NON_INTERACTIVE; then
    APPLY_DECISION="yes"
    echo "Non-interactive mode: Automatically applying generated files."
  else
    ask "Apply the generated files? (yes/no/review)"
    read -r APPLY_DECISION

    if [[ "${APPLY_DECISION,,}" == "review" ]]; then
      warn "Opening output for review: $STATE_DIR/coder-output.md"
      ${EDITOR:-cat} "$STATE_DIR/coder-output.md"
      ask "Apply now? (yes/no)"
      read -r APPLY_DECISION
    fi
  fi

  if [[ "${APPLY_DECISION,,}" == "yes" ]] || [[ "${APPLY_DECISION,,}" == "y" ]]; then
    # Parse and write files from the output
    python3 - "$STATE_DIR/coder-output.md" << 'PYEOF'
import sys, re, os

content = open(sys.argv[1]).read()
# Extract FILE blocks
pattern = r'### FILE: (.+?)\n```(?:typescript|ts|javascript|js)?\n(.*?)```'
matches = re.findall(pattern, content, re.DOTALL)

if not matches:
    print("No file blocks found in output. Please apply manually.")
    sys.exit(0)

for filepath, file_content in matches:
    filepath = filepath.strip()
    os.makedirs(os.path.dirname(filepath) if '/' in filepath else '.', exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(file_content)
    print(f"Written: {filepath}")
PYEOF
    ok "Files written"
  else
    warn "Files not applied automatically. Apply manually from: $STATE_DIR/coder-output.md"
  fi

  # Build validation after coder
  log "Validating TypeScript compilation..."
  TSC_ATTEMPTS=0
  while [ $TSC_ATTEMPTS -lt 2 ]; do
    if npx tsc --noEmit > /tmp/tsc-output.log 2>&1; then
      ok "TypeScript: compiles clean"
      break
    else
      TSC_ERRORS=$(cat /tmp/tsc-output.log | head -20)
      warn "TypeScript errors found (attempt $((TSC_ATTEMPTS+1))/2):"
      echo "$TSC_ERRORS"

      if [ $TSC_ATTEMPTS -eq 1 ]; then
        fail "TypeScript compilation failed after 2 attempts. Fix manually."
        if $NON_INTERACTIVE; then
          CONTINUE_ANYWAY="yes"
          echo "Non-interactive mode: Continuing build with errors."
        else
          ask "Continue anyway? (yes/no)"
          read -r CONTINUE_ANYWAY
        fi
        [[ "${CONTINUE_ANYWAY,,}" != "yes" ]] && exit 1
        break
      fi

      log "Asking coder to fix TypeScript errors..."
      FIX_OUTPUT=$(ollama_call "$MODEL_CODE" \
"Fix these TypeScript errors. Return ONLY the fixed file content, nothing else." \
"TypeScript errors:
$TSC_ERRORS

Fix all errors. Show each fixed file as:
### FILE: path/to/file.ts
\`\`\`typescript
// fixed content
\`\`\`" 4000)
      save_state "coder-ts-fix-$TSC_ATTEMPTS" "$FIX_OUTPUT"
      warn "Review and apply fixes from: $STATE_DIR/coder-ts-fix-$TSC_ATTEMPTS.md"
    fi
    TSC_ATTEMPTS=$((TSC_ATTEMPTS + 1))
  done

  CODER_REPORT="Files written. See $STATE_DIR/coder-output.md for full report."
  save_state "coder-report" "$CODER_REPORT"
fi

ok "Coder stage complete"

# ── STAGE 3: AUDIT (parallel via background jobs) ────────────────────────────
stage "STAGE 3 — Parallel Audit (Auditor + Security + DB + Dependencies)"

log "Running 4 audit agents in parallel..."

# Auditor
if ! already_done "audit-report"; then
  (
    AUDIT=$(ollama_call "$MODEL_ANALYSIS" \
"You are a senior code quality auditor. Be specific — file:line for every issue.
Only flag real issues you can see in the code. Do not invent problems." \
"Feature: $FEATURE_REQUEST

Run these checks mentally based on the code written:
1. Does the implementation match the feature requirements?
2. Are all error paths handled?
3. Are there unit AND integration tests?
4. Any obvious N+1 queries or missing indexes?
5. Are all public methods documented?
6. SOLID principle violations?

Review these files: $(git diff --name-only HEAD 2>/dev/null | head -20)

Output:
## AUDIT REPORT
### CRITICAL: list or NONE
### WARNING: list or NONE
### SUGGESTION: list or NONE
### Test Coverage: describe what's covered
### Summary: POOR/ACCEPTABLE/GOOD — FIX_CRITICAL/APPROVE_WITH_WARNINGS/APPROVE" 3000)
    save_state "audit-report" "$AUDIT"
  ) &
  AUDITOR_PID=$!
fi

# Security
if ! already_done "security-report"; then
  (
    # Run actual security checks
    SEC_FINDINGS=""
    SEC_FINDINGS+="Hardcoded secrets check:\n$(grep -rn "password\|secret\|api_key\|token" --include="*.ts" src/ 2>/dev/null | grep -v ".spec." | grep -v "process.env" | head -10 || echo 'NONE')\n\n"
    SEC_FINDINGS+="Raw SQL check:\n$(grep -rn 'query(`\|query('"'"'' --include="*.ts" src/ 2>/dev/null | head -10 || echo 'NONE')\n\n"

    SEC=$(ollama_call "$MODEL_ANALYSIS" \
"You are a security engineer. Only report issues you can verify from the findings below.
Do not invent vulnerabilities." \
"Feature: $FEATURE_REQUEST

Security findings from grep:
$SEC_FINDINGS

Changed files: $(git diff --name-only HEAD 2>/dev/null | head -15)

Rate each finding:
## SECURITY REPORT
### CRITICAL: list CVE-style with file:line or NONE
### HIGH: list or NONE
### MEDIUM: list or NONE
### Summary: CRITICAL_ISSUES/NEEDS_WORK/ACCEPTABLE — BLOCK_MERGE/FIX_BEFORE_PROD/APPROVE" 2000)
    save_state "security-report" "$SEC"
  ) &
  SECURITY_PID=$!
fi

# DB Migrator
if ! already_done "db-report"; then
  (
    MIGRATION_FILES=$(find . -path "*/migrations/*.ts" -o -path "*/migrations/*.sql" 2>/dev/null | grep -v node_modules | head -10)
    DB=$(ollama_call "$MODEL_CODE" \
"You are a PostgreSQL database engineer. Assess migration safety.
Only report issues visible in the migration files shown." \
"Feature: $FEATURE_REQUEST

Migration files found:
$MIGRATION_FILES

Changed entity files: $(git diff --name-only HEAD 2>/dev/null | grep -i "entit\|model\|schema\|migrat" | head -10)

Check:
1. Does every migration have a down() method?
2. Any DROP COLUMN without deprecation window?
3. Any NOT NULL column added without DEFAULT?
4. Any foreign key without an index?

## DB MIGRATION REPORT
### CRITICAL: list or NONE
### HIGH: list or NONE
### Reversibility: all have down(): YES/NO
### Summary: UNSAFE/NEEDS_WORK/SAFE — BLOCK_MERGE/FIX_BEFORE_PROD/APPROVE" 2000)
    save_state "db-report" "$DB"
  ) &
  DB_PID=$!
fi

# Dependency Auditor
if ! already_done "deps-report"; then
  (
    NPM_AUDIT=$(npm audit --audit-level=moderate 2>&1 | tail -30 || true)
    NPM_OUTDATED=$(npm outdated 2>&1 | head -20 || true)
    DEPS=$(ollama_call "$MODEL_LIGHT" \
"Summarize dependency security findings. Only report real CVEs from the npm audit output." \
"npm audit output:
$NPM_AUDIT

npm outdated output:
$NPM_OUTDATED

## DEPENDENCY AUDIT REPORT
### CRITICAL CVEs: list with package@version and CVE ID or NONE
### HIGH CVEs: list or NONE
### Outdated (major behind): list or NONE
### Summary: CRITICAL_ISSUES/NEEDS_WORK/ACCEPTABLE — BLOCK_MERGE/FIX_BEFORE_PROD/APPROVE" 2000)
    save_state "deps-report" "$DEPS"
  ) &
  DEPS_PID=$!
fi

# Wait for all background jobs
log "Waiting for all audit agents..."
wait "${AUDITOR_PID:-}" 2>/dev/null || true
wait "${SECURITY_PID:-}" 2>/dev/null || true
wait "${DB_PID:-}" 2>/dev/null || true
wait "${DEPS_PID:-}" 2>/dev/null || true

ok "All audit agents complete"

AUDIT_REPORT=$(cat "$STATE_DIR/audit-report.md" 2>/dev/null || echo "SKIPPED")
SECURITY_REPORT=$(cat "$STATE_DIR/security-report.md" 2>/dev/null || echo "SKIPPED")
DB_REPORT=$(cat "$STATE_DIR/db-report.md" 2>/dev/null || echo "SKIPPED")
DEPS_REPORT=$(cat "$STATE_DIR/deps-report.md" 2>/dev/null || echo "SKIPPED")

# Check for CRITICALs
CRITICALS=""
for report in "$AUDIT_REPORT" "$SECURITY_REPORT" "$DB_REPORT" "$DEPS_REPORT"; do
  FOUND=$(echo "$report" | grep -A 3 "### CRITICAL" | grep -v "^### CRITICAL" | grep -v "^NONE" | grep -v "^$" | head -5)
  [ -n "$FOUND" ] && CRITICALS+="$FOUND\n"
done

# ── STAGE 4: FIX LOOP ────────────────────────────────────────────────────────
FIX_ATTEMPTS=0
MAX_FIX_ATTEMPTS=3

while [ -n "$CRITICALS" ] && [ $FIX_ATTEMPTS -lt $MAX_FIX_ATTEMPTS ]; do
  FIX_ATTEMPTS=$((FIX_ATTEMPTS + 1))
  stage "STAGE 4 — Fix Loop (attempt $FIX_ATTEMPTS/$MAX_FIX_ATTEMPTS)"

  warn "Critical issues found:"
  echo -e "$CRITICALS"

  FIX_OUTPUT=$(ollama_call "$MODEL_CODE" \
"You are fixing critical issues in the codebase. Be precise and surgical.
Only fix the issues listed. Do not refactor unrelated code." \
"Feature: $FEATURE_REQUEST

Critical issues to fix:
$CRITICALS

For each fix, show:
### FIX: [issue description]
### FILE: path/to/file.ts
\`\`\`typescript
// fixed code
\`\`\`
### VERIFY: command to run to confirm fix" 4000)

  save_state "fix-attempt-$FIX_ATTEMPTS" "$FIX_OUTPUT"
  warn "Review fixes: $STATE_DIR/fix-attempt-$FIX_ATTEMPTS.md"

  if $NON_INTERACTIVE; then
    FIX_DECISION="yes"
    echo "Non-interactive mode: Automatically applying fixes."
  else
    ask "Apply fixes and re-run audit? (yes/no)"
    read -r FIX_DECISION
  fi
  [[ "${FIX_DECISION,,}" != "yes" ]] && break

  # Re-check
  CRITICALS=$(cat "$STATE_DIR/audit-report.md" "$STATE_DIR/security-report.md" "$STATE_DIR/db-report.md" 2>/dev/null | \
    grep -A 3 "### CRITICAL" | grep -v "^### CRITICAL" | grep -v "^NONE" | grep -v "^$" | head -10 || true)
done

if [ -n "$CRITICALS" ] && [ $FIX_ATTEMPTS -ge $MAX_FIX_ATTEMPTS ]; then
  fail "Max fix attempts ($MAX_FIX_ATTEMPTS) reached. Unresolved issues:"
  echo -e "$CRITICALS"
  if $NON_INTERACTIVE; then
    ESCALATION="continue"
    echo "Non-interactive mode: Automatically continuing despite unresolved issues."
  else
    ask "Options: CONTINUE (accept risk) / ABORT"
    read -r ESCALATION
  fi
  [[ "${ESCALATION,,}" == "abort" ]] && { log "Pipeline aborted. State saved: $STATE_DIR"; exit 0; }
fi

# ── STAGE 5: REVIEWER ────────────────────────────────────────────────────────
stage "STAGE 5 — Reviewer (Final Go/No-Go)"

if ! already_done "reviewer-decision"; then
  log "Running reviewer..."

  # Run actual checks
  lint_result="SKIPPED"
  test_result="SKIPPED"
  build_result="SKIPPED"
  npm run lint > /tmp/lint.log 2>&1 && lint_result="PASS" || lint_result="FAIL: $(tail -5 /tmp/lint.log)"
  npm run test -- --passWithNoTests > /tmp/test.log 2>&1 && test_result="PASS" || test_result="FAIL: $(tail -5 /tmp/test.log)"
  npm run build > /tmp/build.log 2>&1 && build_result="PASS" || build_result="FAIL: $(tail -5 /tmp/build.log)"

  REVIEWER=$(ollama_call "$MODEL_REASON" \
"You are a principal engineer making the final merge decision.
Base your decision ONLY on the reports and check results provided.
Do not invent issues." \
"Feature: $FEATURE_REQUEST

Lint: $lint_result
Tests: $test_result
Build: $build_result

Audit: $(echo "$AUDIT_REPORT" | tail -5)
Security: $(echo "$SECURITY_REPORT" | tail -5)
DB: $(echo "$DB_REPORT" | tail -5)
Deps: $(echo "$DEPS_REPORT" | tail -5)

Decision:
## REVIEWER: GO ✅  or  ## REVIEWER: NO-GO ❌
### Verification Summary: lint/tests/build status
### Remaining Warnings: acceptable issues
OR
### Blockers: exact issues that are NOT resolved" 2000)

  save_state "reviewer-decision" "$REVIEWER"
fi

echo "$(cat "$STATE_DIR/reviewer-decision.md")"

if ! grep -q "GO ✅" "$STATE_DIR/reviewer-decision.md" 2>/dev/null; then
  if $NON_INTERACTIVE; then
    OVERRIDE="yes"
    echo "Non-interactive mode: Automatically overriding reviewer NO-GO."
  else
    ask "Continue anyway? (yes/no)"
    read -r OVERRIDE
  fi
  [[ "${OVERRIDE,,}" != "yes" ]] && { log "Pipeline stopped. State: $STATE_DIR"; exit 0; }
fi

ok "Reviewer: GO"

# ── STAGE 6: POST-GO (parallel) ──────────────────────────────────────────────
stage "STAGE 6 — Post-GO: Commit Message + Changelog + PR Description"

# Commit Writer
(
  DIFF=$(git diff --stat 2>/dev/null | head -20)
  DIFF_FULL=$(git diff 2>/dev/null | head -100)
  NEW_FILES=$(git ls-files --others --exclude-standard 2>/dev/null | head -10)

  COMMIT=$(ollama_call "$MODEL_LIGHT" \
"Write a conventional commit message. Use ONLY the diff provided — do not invent changes." \
"git diff --stat:
$DIFF

New untracked files:
$NEW_FILES

Feature: $FEATURE_REQUEST

Write ONLY the commit message in this format:
feat(scope): short summary under 72 chars

## What changed
- bullet: concrete change

## Why
- business reason

## Tests
- what was tested

## Breaking changes
NONE

Refs: (remove if no issue)" 1500)
  save_state "commit-message" "$COMMIT"
) &

# Changelog
(
  CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
  CHANGE=$(ollama_call "$MODEL_LIGHT" \
"Update the CHANGELOG. Determine if this is a patch/minor/major bump based on the feature.
Use Keep a Changelog format. Only document the changes shown." \
"Current version: $CURRENT_VERSION
Feature: $FEATURE_REQUEST
Changed files: $(git diff --name-only HEAD 2>/dev/null | head -15)

Write the new CHANGELOG entry and the new version number:
## NEW VERSION: X.Y.Z
## [X.Y.Z] — $(date +%Y-%m-%d)
### Added / Changed / Fixed (use only relevant sections)" 1500)
  save_state "changelog-entry" "$CHANGE"
) &

# PR Writer
(
  PR=$(ollama_call "$MODEL_LIGHT" \
"Write a GitHub pull request description. Be concrete — reference actual files and endpoints." \
"Feature: $FEATURE_REQUEST
Branch: $BRANCH

Coder report summary: $(cat "$STATE_DIR/coder-report.md" 2>/dev/null | head -10)
Audit: $(cat "$STATE_DIR/audit-report.md" 2>/dev/null | tail -3)
Security: $(cat "$STATE_DIR/security-report.md" 2>/dev/null | tail -3)

Write a PR description:
## Summary
## Changes (Backend / Frontend / Database / Config)
## Motivation
## Test Plan (checklist)
## Breaking Changes
## Deployment Notes" 2000)
  save_state "pr-description" "$PR"
) &

wait
ok "All post-GO agents complete"

# ── STAGE 7: PRESENT TO HUMAN ────────────────────────────────────────────────
stage "STAGE 7 — Pipeline Complete"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BOLD}${GREEN}✅ OLLAMA PIPELINE COMPLETE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Feature: $FEATURE_REQUEST"
echo "Branch:  $BRANCH"
echo "State:   $STATE_DIR"
echo ""
echo "📝 COMMIT MESSAGE:"
echo "━━━━━━━━━━━━━━━━━━"
cat "$STATE_DIR/commit-message.md" 2>/dev/null
echo ""
echo "📋 CHANGELOG ENTRY:"
echo "━━━━━━━━━━━━━━━━━━"
cat "$STATE_DIR/changelog-entry.md" 2>/dev/null
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚠️  IMPORTANT — Local model output. Review before committing:${NC}"
echo ""
echo "1. Review all generated code (local models can hallucinate)"
echo "2. Run: npm run test && npm run build"
echo "3. Then:"
echo ""
echo "   git add ."
echo "   git commit -m \"<first line of commit message above>\""
echo "   git push -u origin $BRANCH"
echo "   gh pr create --title \"...\" --body \"$(cat "$STATE_DIR/pr-description.md" 2>/dev/null | head -1)\""
echo ""
echo "📁 All agent outputs saved to: $STATE_DIR/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if $AUTO_PUSH; then
  stage "STAGE 8 — Auto-commit and Push"
  log "Adding files to git..."
  git add .
  
  # Extract first line of commit message
  COMMIT_TITLE=$(head -n 1 "$STATE_DIR/commit-message.md" 2>/dev/null || echo "feat: update by autopilot dev pipeline")
  log "Committing changes: $COMMIT_TITLE"
  git commit -m "$COMMIT_TITLE" -m "$(cat "$STATE_DIR/commit-message.md" 2>/dev/null)"
  
  log "Pushing branch $BRANCH to origin..."
  git push -u origin "$BRANCH"
  ok "Successfully committed and pushed changes to remote branch $BRANCH"
fi
