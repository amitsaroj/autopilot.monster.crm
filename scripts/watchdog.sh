#!/usr/bin/env bash
# watchdog.sh — Background pipeline health monitor
#
# Runs independently of Claude Code — use this when running ollama-pipeline.sh
# or when you want to monitor a running pipeline from a separate terminal.
#
# Usage:
#   bash scripts/watchdog.sh                           # monitor current pipeline
#   bash scripts/watchdog.sh --interval 300           # check every 5 minutes
#   bash scripts/watchdog.sh --state .pipeline-state/2026-06-13T10-00/  # specific run
#   bash scripts/watchdog.sh --status                 # show current snapshot and exit
#   bash scripts/watchdog.sh --stop                   # stop running watchdog

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
WATCHDOG_INTERVAL="${WATCHDOG_INTERVAL:-600}"
WATCHDOG_STUCK_THRESHOLD="${WATCHDOG_STUCK_THRESHOLD:-900}"
WATCHDOG_PING_MAX="${WATCHDOG_PING_MAX:-3}"
PIPELINE_STATE_DIR="${PIPELINE_STATE_DIR:-.pipeline-state/current}"
PID_FILE=".pipeline-state/watchdog.pid"
LOG_FILE=""

# Colors
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

# ── Argument parsing ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval|-i)   WATCHDOG_INTERVAL="$2"; shift 2 ;;
    --state|-s)      PIPELINE_STATE_DIR="$2"; shift 2 ;;
    --stuck|-t)      WATCHDOG_STUCK_THRESHOLD="$2"; shift 2 ;;
    --pings|-p)      WATCHDOG_PING_MAX="$2"; shift 2 ;;
    --status)
      if [ -f "$PIPELINE_STATE_DIR/status-snapshot.md" ]; then
        cat "$PIPELINE_STATE_DIR/status-snapshot.md"
      else
        echo "No status snapshot found at: $PIPELINE_STATE_DIR/status-snapshot.md"
        echo "Is the pipeline running? Start with: bash scripts/watchdog.sh"
      fi
      exit 0
      ;;
    --stop)
      if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        kill "$PID" 2>/dev/null && echo "Watchdog (PID $PID) stopped." || echo "Watchdog not running."
        rm -f "$PID_FILE"
      else
        echo "No watchdog PID file found. Nothing to stop."
      fi
      exit 0
      ;;
    --log|-l)
      LOG_FILE="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

LOG_FILE="${LOG_FILE:-$PIPELINE_STATE_DIR/watchdog.log}"

# ── Helpers ───────────────────────────────────────────────────────────────────
log() {
  local ts
  ts=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$ts] $*" | tee -a "$LOG_FILE"
}

log_only() {
  local ts
  ts=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$ts] $*" >> "$LOG_FILE"
}

agent_status_color() {
  case "$1" in
    completed|done)  echo -e "${GREEN}✅ $1${NC}" ;;
    in_progress)     echo -e "${BLUE}🔄 $1${NC}" ;;
    pending)         echo -e "${YELLOW}⏳ $1${NC}" ;;
    stuck)           echo -e "${YELLOW}⚠️  STUCK${NC}" ;;
    failed|error)    echo -e "${RED}❌ $1${NC}" ;;
    *)               echo "$1" ;;
  esac
}

# ── Setup ─────────────────────────────────────────────────────────────────────
mkdir -p "$PIPELINE_STATE_DIR" "$(dirname "$PID_FILE")"

# Save PID for --stop to work
echo $$ > "$PID_FILE"

# Trap for clean exit
cleanup() {
  log_only "WATCHDOG SHUTDOWN (signal received)"
  rm -f "$PID_FILE"
  exit 0
}
trap cleanup SIGTERM SIGINT

# ── Startup banner ────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  🐕 PIPELINE WATCHDOG STARTED${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
printf "  Interval:    ${WATCHDOG_INTERVAL}s (%d min)\n" "$((WATCHDOG_INTERVAL / 60))"
printf "  Stuck after: ${WATCHDOG_STUCK_THRESHOLD}s (%d min)\n" "$((WATCHDOG_STUCK_THRESHOLD / 60))"
echo  "  Max pings:   ${WATCHDOG_PING_MAX} before human escalation"
echo  "  State dir:   ${PIPELINE_STATE_DIR}"
echo  "  Log:         ${LOG_FILE}"
echo  "  PID:         $$"
echo  ""
echo  "  Stop with:   bash scripts/watchdog.sh --stop"
echo  "  Status:      bash scripts/watchdog.sh --status"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log "WATCHDOG STARTED (PID=$$, interval=${WATCHDOG_INTERVAL}s, stuck_threshold=${WATCHDOG_STUCK_THRESHOLD}s, max_pings=${WATCHDOG_PING_MAX})"

# ── State tracking ────────────────────────────────────────────────────────────
declare -A PING_COUNTS
declare -A FAIL_REPORTED
CHECK_COUNT=0

# ── Health check function ─────────────────────────────────────────────────────
run_health_check() {
  CHECK_COUNT=$((CHECK_COUNT + 1))
  local ts
  ts=$(date '+%Y-%m-%d %H:%M:%S')
  local NOW
  NOW=$(date +%s)

  echo ""
  echo -e "${BOLD}[$ts] CHECK #${CHECK_COUNT}${NC}"
  log_only "=== CHECK #${CHECK_COUNT} ==="

  local STUCK_AGENTS=()
  local FAILED_AGENTS=()
  local COMPLETED_COUNT=0
  local IN_PROGRESS_COUNT=0
  local PENDING_COUNT=0
  local TOTAL=0

  # Scan task files
  local has_tasks=false
  for task_file in "$PIPELINE_STATE_DIR"/task-*.json; do
    [ -f "$task_file" ] || continue
    has_tasks=true
    TOTAL=$((TOTAL + 1))

    # Parse JSON
    AGENT=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('owner','unknown'))" 2>/dev/null || echo "unknown")
    STATUS=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('status','unknown'))" 2>/dev/null || echo "unknown")
    LAST_UPDATE=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('last_updated',0))" 2>/dev/null || echo "0")
    SUBJECT=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('subject','?')[:60])" 2>/dev/null || echo "?")
    PROGRESS=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('progress','')[:50])" 2>/dev/null || echo "")

    SECONDS_SINCE=$((NOW - LAST_UPDATE))
    local display_status="$STATUS"

    # Determine if stuck
    if [[ "$STATUS" == "in_progress" ]] && [[ "$SECONDS_SINCE" -gt "$WATCHDOG_STUCK_THRESHOLD" ]]; then
      display_status="stuck"
      STUCK_AGENTS+=("$AGENT")
    fi

    case "$STATUS" in
      completed|done) COMPLETED_COUNT=$((COMPLETED_COUNT + 1)) ;;
      in_progress)    IN_PROGRESS_COUNT=$((IN_PROGRESS_COUNT + 1)) ;;
      pending)        PENDING_COUNT=$((PENDING_COUNT + 1)) ;;
      failed|error)   FAILED_AGENTS+=("$AGENT") ;;
    esac

    local mins=$((SECONDS_SINCE / 60))
    printf "  %-20s %s  (%dm ago)  %s\n" "$AGENT" "$(agent_status_color "$display_status")" "$mins" "$PROGRESS"
    log_only "  $AGENT: $display_status (${SECONDS_SINCE}s ago) — $SUBJECT"
  done

  if ! $has_tasks; then
    echo -e "  ${YELLOW}No task files found in $PIPELINE_STATE_DIR${NC}"
    echo "  (Pipeline may not have started yet, or state dir is wrong)"
    log_only "  No task files found"
    return
  fi

  echo ""
  printf "  ${GREEN}✅ Done: %d${NC}  ${BLUE}🔄 Active: %d${NC}  ${YELLOW}⏳ Pending: %d${NC}  ${YELLOW}⚠️  Stuck: %d${NC}  ${RED}❌ Failed: %d${NC}\n" \
    "$COMPLETED_COUNT" "$IN_PROGRESS_COUNT" "$PENDING_COUNT" "${#STUCK_AGENTS[@]}" "${#FAILED_AGENTS[@]}"
  log_only "  SUMMARY: done=$COMPLETED_COUNT active=$IN_PROGRESS_COUNT pending=$PENDING_COUNT stuck=${#STUCK_AGENTS[@]} failed=${#FAILED_AGENTS[@]}"

  # ── Handle stuck agents ───────────────────────────────────────────────────
  for agent in "${STUCK_AGENTS[@]}"; do
    ping_count="${PING_COUNTS[$agent]:-0}"
    ping_count=$((ping_count + 1))
    PING_COUNTS[$agent]=$ping_count

    if [ "$ping_count" -le "$WATCHDOG_PING_MAX" ]; then
      echo ""
      echo -e "  ${YELLOW}⚠️  PING #${ping_count}/${WATCHDOG_PING_MAX} → $agent${NC}"
      log "PING #${ping_count}/${WATCHDOG_PING_MAX} → $agent (no update in $((WATCHDOG_STUCK_THRESHOLD/60))+ min)"

      # Write ping file
      cat > "$PIPELINE_STATE_DIR/ping-${agent}.json" << PING_EOF
{
  "type": "watchdog_ping",
  "agent": "$agent",
  "ping_number": $ping_count,
  "max_pings": $WATCHDOG_PING_MAX,
  "timestamp": "$(date '+%Y-%m-%d %H:%M:%S')",
  "message": "Watchdog ping #${ping_count}: You appear stuck (no task update in ${WATCHDOG_STUCK_THRESHOLD}s). Resume your current task and update your task file. If you are blocked by another agent, state that explicitly."
}
PING_EOF
    else
      # Escalate
      if [[ -z "${FAIL_REPORTED[$agent]:-}" ]]; then
        FAIL_REPORTED[$agent]=1
        echo ""
        echo -e "  ${RED}🚨 ESCALATING TO HUMAN: $agent (${ping_count} pings, no response)${NC}"
        log "ESCALATION: $agent did not respond after ${ping_count} pings"

        cat >> "$PIPELINE_STATE_DIR/HUMAN_ATTENTION_REQUIRED.md" << ALERT_EOF

## 🚨 WATCHDOG ESCALATION — $(date '+%Y-%m-%d %H:%M:%S')

**Agent:** $agent
**Problem:** Did not respond after $ping_count watchdog pings
**Time stuck:** ~$((ping_count * WATCHDOG_INTERVAL / 60)) minutes

**What to do:**
1. Check if Claude Code is still running
2. Look for error output in the terminal
3. Restart the agent by re-sending its task prompt
4. Or resume the pipeline:
   bash scripts/ollama-pipeline.sh --resume "$PIPELINE_STATE_DIR"

ALERT_EOF
        echo -e "  ${RED}Written to: $PIPELINE_STATE_DIR/HUMAN_ATTENTION_REQUIRED.md${NC}"
      fi
    fi
  done

  # Reset ping counts for agents that recovered (back to in_progress with recent update)
  for agent in "${!PING_COUNTS[@]}"; do
    local agent_file="$PIPELINE_STATE_DIR/task-${agent}.json"
    if [ -f "$agent_file" ]; then
      local s
      s=$(python3 -c "import json; d=json.load(open('$agent_file')); print(d.get('status',''))" 2>/dev/null)
      local lu
      lu=$(python3 -c "import json; d=json.load(open('$agent_file')); print(d.get('last_updated',0))" 2>/dev/null)
      local since=$((NOW - lu))
      if [[ "$s" == "in_progress" ]] && [[ "$since" -lt "$WATCHDOG_STUCK_THRESHOLD" ]]; then
        log "  $agent recovered — resetting ping count"
        PING_COUNTS[$agent]=0
        unset "FAIL_REPORTED[$agent]" 2>/dev/null || true
        rm -f "$PIPELINE_STATE_DIR/ping-${agent}.json"
      fi
    fi
  done

  # ── Handle failed agents ──────────────────────────────────────────────────
  for agent in "${FAILED_AGENTS[@]}"; do
    if [[ -z "${FAIL_REPORTED[$agent]:-}" ]]; then
      FAIL_REPORTED[$agent]=1
      echo ""
      echo -e "  ${RED}❌ FAILURE: $agent — writing escalation${NC}"
      log "FAILURE: $agent — escalating to human"

      cat >> "$PIPELINE_STATE_DIR/HUMAN_ATTENTION_REQUIRED.md" << FAIL_EOF

## ❌ AGENT FAILURE — $(date '+%Y-%m-%d %H:%M:%S')

**Agent:** $agent
**Status:** FAILED

Check the agent output for errors. You may need to manually run the
$agent stage or fix the underlying issue before resuming.

FAIL_EOF
    fi
  done

  # ── Write status snapshot every 3 checks ─────────────────────────────────
  if [ $((CHECK_COUNT % 3)) -eq 0 ]; then
    write_status_snapshot "$COMPLETED_COUNT" "$IN_PROGRESS_COUNT" "$PENDING_COUNT" "${#STUCK_AGENTS[@]}" "${#FAILED_AGENTS[@]}"
  fi
}

write_status_snapshot() {
  local completed="$1" active="$2" pending="$3" stuck="$4" failed="$5"
  local RUNTIME=$(( ($(date +%s) - START_TIME) / 60 ))

  {
    echo "# Pipeline Status Snapshot"
    echo "**Generated:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo "**Watchdog running for:** ${RUNTIME}m"
    echo ""
    echo "## Summary"
    echo "- ✅ Completed: $completed"
    echo "- 🔄 Active:    $active"
    echo "- ⏳ Pending:   $pending"
    echo "- ⚠️  Stuck:    $stuck"
    echo "- ❌ Failed:    $failed"
    echo ""
    echo "## Agent Details"
    echo ""
    echo "| Agent | Status | Last update | Progress |"
    echo "|-------|--------|-------------|----------|"
    local NOW
    NOW=$(date +%s)
    for task_file in "$PIPELINE_STATE_DIR"/task-*.json; do
      [ -f "$task_file" ] || continue
      local a s lu p mins
      a=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('owner','?'))" 2>/dev/null)
      s=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('status','?'))" 2>/dev/null)
      lu=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('last_updated',0))" 2>/dev/null)
      p=$(python3 -c "import json; d=json.load(open('$task_file')); print(d.get('progress','')[:40])" 2>/dev/null)
      mins=$(( (NOW - lu) / 60 ))
      echo "| $a | $s | ${mins}m ago | $p |"
    done
    echo ""
    echo "## Watchdog Stats"
    echo "- Checks run: $CHECK_COUNT"
    echo "- Pings sent: $(find "$PIPELINE_STATE_DIR" -name 'ping-*.json' 2>/dev/null | wc -l)"
    echo "- Escalations: $(grep -c 'ESCALAT' "$LOG_FILE" 2>/dev/null || echo 0)"
  } > "$PIPELINE_STATE_DIR/status-snapshot.md"

  log_only "Status snapshot written (check #$CHECK_COUNT)"
}

# ── Main loop ─────────────────────────────────────────────────────────────────
START_TIME=$(date +%s)

# Run first check immediately
run_health_check

while true; do
  # Check if pipeline is done
  if [ -f "$PIPELINE_STATE_DIR/pipeline.done" ]; then
    log "Pipeline complete — watchdog shutting down"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🐕 WATCHDOG DONE — pipeline complete${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    write_status_snapshot 0 0 0 0 0
    rm -f "$PID_FILE"
    exit 0
  fi

  # Check if human attention file grew (alert to terminal)
  if [ -f "$PIPELINE_STATE_DIR/HUMAN_ATTENTION_REQUIRED.md" ]; then
    local ALERT_LINES
    ALERT_LINES=$(wc -l < "$PIPELINE_STATE_DIR/HUMAN_ATTENTION_REQUIRED.md" 2>/dev/null || echo 0)
    if [ "${LAST_ALERT_LINES:-0}" -lt "$ALERT_LINES" ]; then
      LAST_ALERT_LINES=$ALERT_LINES
      echo ""
      echo -e "${RED}🚨 HUMAN ATTENTION REQUIRED — see: $PIPELINE_STATE_DIR/HUMAN_ATTENTION_REQUIRED.md${NC}"
    fi
  fi

  echo ""
  echo -e "${CYAN}[watchdog] sleeping ${WATCHDOG_INTERVAL}s until next check... (Ctrl+C to stop)${NC}"
  sleep "$WATCHDOG_INTERVAL"
  run_health_check
done
