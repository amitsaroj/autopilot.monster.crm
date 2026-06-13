#!/usr/bin/env bash
# check-models.sh — Detect available AI models and report the pipeline strategy
# Usage: bash scripts/check-models.sh

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Autopilot Dev Pipeline — Model Availability Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CLAUDE_AVAILABLE=false
OPENAI_AVAILABLE=false
CURSOR_AVAILABLE=false
CUSTOM_AVAILABLE=false
OLLAMA_AVAILABLE=false

PRIMARY_MODEL=""
STRATEGY=""

# ── 1. Claude (Anthropic) ────────────────────────────────────────────────────
if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  # Validate the key is not a placeholder
  if [[ "$ANTHROPIC_API_KEY" != "sk-ant-placeholder"* ]] && [[ ${#ANTHROPIC_API_KEY} -gt 20 ]]; then
    CLAUDE_AVAILABLE=true
    PRIMARY_MODEL="Claude"
    echo -e "${GREEN}[✅] Claude (Anthropic)${NC}"
    echo "     Key: ${ANTHROPIC_API_KEY:0:12}... (${#ANTHROPIC_API_KEY} chars)"
    echo "     Models: claude-opus-4-6 (thinker/coder/reviewer)"
    echo "             claude-sonnet-4-6 (all other agents)"
  else
    echo -e "${YELLOW}[⚠️ ] Claude (Anthropic)${NC} — ANTHROPIC_API_KEY looks like a placeholder"
  fi
else
  echo -e "${RED}[❌] Claude (Anthropic)${NC} — ANTHROPIC_API_KEY not set"
fi

echo ""

# ── 2. OpenAI / Codex ────────────────────────────────────────────────────────
if [ -n "${OPENAI_API_KEY:-}" ]; then
  if [[ "$OPENAI_API_KEY" != "sk-placeholder"* ]] && [[ ${#OPENAI_API_KEY} -gt 20 ]]; then
    OPENAI_AVAILABLE=true
    [ -z "$PRIMARY_MODEL" ] && PRIMARY_MODEL="OpenAI"
    echo -e "${GREEN}[✅] OpenAI / Codex${NC}"
    echo "     Key: ${OPENAI_API_KEY:0:10}... (${#OPENAI_API_KEY} chars)"
    echo "     Models: gpt-4o (complex agents), gpt-4o-mini (light agents)"
  else
    echo -e "${YELLOW}[⚠️ ] OpenAI / Codex${NC} — OPENAI_API_KEY looks like a placeholder"
  fi
else
  echo -e "${RED}[❌] OpenAI / Codex${NC} — OPENAI_API_KEY not set"
fi

echo ""

# ── 3. Cursor ────────────────────────────────────────────────────────────────
CURSOR_AVAILABLE=false
echo -e "${RED}[❌] Cursor${NC} — skipped check (running in Ollama pipeline mode)"

echo ""

# ── 4. Custom OpenAI-compatible endpoint ─────────────────────────────────────
if [ -n "${OPENAI_BASE_URL:-}" ] && [ "$OPENAI_BASE_URL" != "https://api.openai.com/v1" ]; then
  CUSTOM_AVAILABLE=true
  [ -z "$PRIMARY_MODEL" ] && PRIMARY_MODEL="Custom"
  echo -e "${GREEN}[✅] Custom OpenAI-compatible endpoint${NC}"
  echo "     URL: $OPENAI_BASE_URL"
  echo "     Key: ${OPENAI_API_KEY:0:10}..."
else
  echo -e "${RED}[❌] Custom endpoint${NC} — OPENAI_BASE_URL not set to a custom URL"
fi

echo ""

# ── 5. Ollama (local) ────────────────────────────────────────────────────────
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
if curl -sf "$OLLAMA_HOST/api/tags" > ./ollama_models.json 2>/dev/null; then
  OLLAMA_AVAILABLE=true
  [ -z "$PRIMARY_MODEL" ] && PRIMARY_MODEL="Ollama"
  echo -e "${GREEN}[✅] Ollama${NC} — running at $OLLAMA_HOST"

  # List available models
  MODELS=$(python3 -c "
import json, sys
try:
    d = json.load(open('./ollama_models.json'))
    models = [m['name'] for m in d.get('models', [])]
    if models:
        print('     Models: ' + ', '.join(models[:6]))
        if len(models) > 6:
            print(f'             ... and {len(models)-6} more')
    else:
        print('     No models pulled yet')
except: print('     Could not parse model list')
" 2>/dev/null || echo "     Models: (could not list)")
  echo "$MODELS"

  # Check for recommended models
  echo ""
  echo "     Recommendation check:"
  RECOMMENDED=("llama3.1:8b" "llama3.1:70b" "codellama:13b" "deepseek-coder-v2:16b" "qwen2.5-coder:7b")
  HAS_CODE_MODEL=false
  HAS_REASON_MODEL=false

  for model in "${RECOMMENDED[@]}"; do
    if grep -q "\"$model\"" ./ollama_models.json 2>/dev/null; then
      echo -e "     ${GREEN}✓${NC} $model"
      [[ "$model" == *"coder"* ]] && HAS_CODE_MODEL=true
      [[ "$model" == *"70b"* ]] && HAS_REASON_MODEL=true
    else
      echo -e "     ${YELLOW}○${NC} $model (not pulled — run: ollama pull $model)"
    fi
  done

  if ! $HAS_CODE_MODEL; then
    echo ""
    echo -e "     ${YELLOW}⚠️  No code-specialized model found.${NC}"
    echo "     For best results: ollama pull deepseek-coder-v2:16b"
    echo "     Minimum viable:   ollama pull codellama:13b"
  fi
  if ! $HAS_REASON_MODEL; then
    echo ""
    echo -e "     ${YELLOW}⚠️  No large reasoning model found.${NC}"
    echo "     For thinker/reviewer: ollama pull llama3.1:70b"
    echo "     Minimum viable:       ollama pull llama3.1:8b"
  fi
else
  echo -e "${RED}[❌] Ollama${NC} — not running at $OLLAMA_HOST"
  echo "     To start: ollama serve"
  echo "     To install: curl -fsSL https://ollama.com/install.sh | sh"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! $CLAUDE_AVAILABLE && ! $OPENAI_AVAILABLE && ! $CURSOR_AVAILABLE && ! $CUSTOM_AVAILABLE && ! $OLLAMA_AVAILABLE; then
  echo -e "${RED}🚫 NO MODELS AVAILABLE${NC}"
  echo ""
  echo "You need at least one of:"
  echo "  • ANTHROPIC_API_KEY=sk-ant-...  (Claude — recommended)"
  echo "  • OPENAI_API_KEY=sk-...         (OpenAI/Codex)"
  echo "  • Ollama running locally        (free, local)"
  echo ""
  echo "Quickest start (free):"
  echo "  curl -fsSL https://ollama.com/install.sh | sh"
  echo "  ollama serve &"
  echo "  ollama pull llama3.1:8b"
  echo "  ollama pull codellama:13b"
  exit 1
fi

echo ""
echo -e "${BLUE}📊 Strategy:${NC}"

if $CLAUDE_AVAILABLE; then
  echo -e "  ${GREEN}PRIMARY:${NC}  Claude (Anthropic) — full quality pipeline"
  if $OLLAMA_AVAILABLE; then
    echo -e "  ${YELLOW}FALLBACK:${NC} Ollama — if Claude token limit is hit mid-run"
  fi
  echo ""
  echo -e "  ${GREEN}▶ Recommended: run /dev in Claude Code${NC}"
elif $OPENAI_AVAILABLE || $CURSOR_AVAILABLE || $CUSTOM_AVAILABLE; then
  echo -e "  ${GREEN}PRIMARY:${NC}  $PRIMARY_MODEL — good quality pipeline"
  if $OLLAMA_AVAILABLE; then
    echo -e "  ${YELLOW}FALLBACK:${NC} Ollama — if token limit is hit"
  fi
  echo ""
  echo -e "  ${GREEN}▶ Use OpenAI-compatible Claude Code or scripts/ollama-pipeline.sh${NC}"
elif $OLLAMA_AVAILABLE; then
  echo -e "  ${YELLOW}PRIMARY:${NC}  Ollama only — functional but needs human review of all code"
  echo ""
  echo "  Important for Ollama-only mode:"
  echo "  • Review ALL generated code before committing"
  echo "  • Prefer larger models (70b for planning, 16b+ for coding)"
  echo "  • The human checkpoints are even more critical"
  echo ""
  echo -e "  ${GREEN}▶ Run: bash scripts/ollama-pipeline.sh \"your feature request\"${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
