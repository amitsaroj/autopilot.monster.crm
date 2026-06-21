# Model Configuration & Fallback Strategy

This file defines the model priority chain, Ollama setup, and anti-hallucination rules.
Every agent reads this before starting. The model-router agent enforces this at pipeline start.

---

## Model Priority Chain

Agents try models in this order. Use the **first available** option.

```
1. Claude (Anthropic)      → ANTHROPIC_API_KEY set
2. OpenAI / Codex          → OPENAI_API_KEY set
3. Cursor                  → CURSOR_API_KEY set or ~/.cursor/config exists
4. Any OpenAI-compatible   → OPENAI_BASE_URL set to custom endpoint
5. Ollama (local)          → http://localhost:11434 reachable
```

If **nothing** is available: stop and show setup instructions.

---

## Detection

Run `scripts/check-models.sh` to see what's available on your machine:

```bash
bash scripts/check-models.sh
```

Output example:
```
[✅] Claude   — ANTHROPIC_API_KEY found → using claude-sonnet-4-6 / claude-opus-4-6
[❌] OpenAI   — OPENAI_API_KEY not set
[❌] Cursor   — not configured
[✅] Ollama   — running at localhost:11434 → models: llama3.1:8b, codellama:34b
Strategy: FULL_CLAUDE (primary), OLLAMA (fallback if token limit hit)
```

---

## Model Assignments Per Agent

### When running Claude (recommended)

| Agent | Model | Reason |
|-------|-------|--------|
| thinker | claude-opus-4-6 | Deep reasoning needed |
| researcher | claude-sonnet-4-6 | Web search + analysis |
| coder | claude-opus-4-6 | Complex code generation |
| build-validator | claude-sonnet-4-6 | Tool execution |
| docs-writer | claude-sonnet-4-6 | Structured writing |
| auditor | claude-sonnet-4-6 | Code analysis |
| security-sentinel | claude-sonnet-4-6 | Pattern matching |
| db-migrator | claude-sonnet-4-6 | SQL knowledge |
| dependency-auditor | claude-sonnet-4-6 | Tool execution |
| reviewer | claude-opus-4-6 | Final decision |
| commit-writer | claude-sonnet-4-6 | Writing |
| changelog | claude-sonnet-4-6 | Writing |
| pr-writer | claude-sonnet-4-6 | Writing |
| preflight | claude-sonnet-4-6 | Tool execution |
| model-router | claude-haiku-4-5 | Detection only |

### When running OpenAI / Codex

| Agent | Model |
|-------|-------|
| thinker, coder, reviewer | gpt-4o or o4-mini |
| All others | gpt-4o-mini |

### When running Ollama (local fallback)

| Agent | Recommended Model | Minimum Viable |
|-------|-------------------|----------------|
| thinker | llama3.1:70b | llama3.1:8b |
| researcher | llama3.1:70b | llama3.1:8b |
| coder | deepseek-coder-v2:16b OR qwen2.5-coder:32b | codellama:13b |
| build-validator | qwen2.5-coder:7b | codellama:7b |
| docs-writer | llama3.1:8b | mistral:7b |
| auditor | deepseek-r1:32b OR llama3.1:70b | llama3.1:8b |
| security-sentinel | llama3.1:70b | llama3.1:8b |
| db-migrator | qwen2.5-coder:32b | codellama:13b |
| dependency-auditor | llama3.1:8b | mistral:7b |
| reviewer | llama3.1:70b | llama3.1:8b |
| commit-writer | llama3.1:8b | mistral:7b |
| changelog | llama3.1:8b | mistral:7b |
| pr-writer | llama3.1:8b | mistral:7b |

**Minimum viable Ollama setup** (if you have limited RAM):
```bash
ollama pull codellama:13b      # for coder, db-migrator
ollama pull llama3.1:8b        # for everything else
```

**Full quality Ollama setup** (16GB+ VRAM):
```bash
ollama pull deepseek-coder-v2:16b   # coder
ollama pull llama3.1:70b             # thinker, reviewer, auditor
ollama pull qwen2.5-coder:7b         # build-validator, docs-writer
ollama pull llama3.1:8b              # light tasks
```

---

## Ollama Setup

### 1. Install Ollama
```bash
# Linux / Mac
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### 2. Start Ollama
```bash
ollama serve   # runs on http://localhost:11434
```

### 3. Pull recommended models
```bash
# Minimum setup
ollama pull llama3.1:8b
ollama pull codellama:13b

# Check what you have
ollama list
```

### 4. Run the pipeline
```bash
bash scripts/ollama-pipeline.sh "Add WhatsApp webhook that receives messages"
```

---

## Anti-Hallucination Rules for Local Models

Local models (especially <13B) are more likely to:
- Invent npm package names that don't exist
- Generate code using non-existent APIs
- Reference files or functions that aren't in the codebase
- Produce syntactically valid but semantically wrong code

### Rules ALL agents must follow when using Ollama:

1. **Read before you write** — Always read the actual file content before modifying it. Never generate code for a file you haven't read.

2. **Verify package existence** — Before recommending any npm package, run:
   ```bash
   npm info <package-name> version 2>/dev/null || echo "PACKAGE NOT FOUND"
   ```
   Never recommend a package you cannot verify exists.

3. **Temperature = 0** — All code generation uses temperature 0 (deterministic output, less creative drift).
   ```bash
   # In Ollama API calls:
   "options": { "temperature": 0, "top_p": 0.9 }
   ```

4. **Compile after every file** — Run `tsc --noEmit <file>` after writing each TypeScript file. Fix errors before moving to the next file.

5. **No invented APIs** — Only use functions and classes that you can verify exist in the codebase or in the package's `node_modules/<pkg>/index.d.ts`. If unsure, read the type definitions first.

6. **Chunk tasks** — For coder agent: implement one module at a time, verify it compiles, then move to the next. Never generate all files in one shot with a local model.

7. **Self-verify** — After generating code, re-read it and answer: "Does every import exist? Does every function call match its signature?" If no, fix before reporting.

8. **Use structured prompts** — Local models respond better to explicit output formats. Always request output in a specific format with clear delimiters.

9. **Grounding** — Start every prompt with the actual contents of relevant files. Local models with no context will hallucinate; grounded models stay accurate.

10. **Fallback check** — If a local model generates code that fails `tsc --noEmit` twice in a row, pause and report the error to the human rather than continuing to generate broken code.

---

## Token Limit Fallback

If Claude hits its context window or rate limit mid-pipeline:

1. **Save state** — The orchestrator saves all completed stage outputs to `.pipeline-state/`
2. **Switch model** — Re-run the current stage with the next available model in the priority chain
3. **Resume** — Continue from the failed stage with the new model

State file location: `.pipeline-state/<timestamp>/`

```
.pipeline-state/
  thinker-output.md
  researcher-output.md
  coder-report.md
  build-report.md
  docs-report.md
  ...
```

If you need to resume manually after a crash:
```bash
bash scripts/ollama-pipeline.sh --resume .pipeline-state/2026-06-12T10-30-00/
```

---

## Quality Expectations by Model Tier

| Tier | Models | Expected Quality | Best For |
|------|--------|-----------------|----------|
| Tier 1 | claude-opus-4-6, gpt-4o | Production-grade | All stages |
| Tier 2 | claude-sonnet-4-6, gpt-4o-mini | Good, minor cleanup needed | Most stages |
| Tier 3 | llama3.1:70b, deepseek-r1:32b | Acceptable, needs review | Planning, analysis |
| Tier 4 | llama3.1:8b, mistral:7b | Functional, needs verification | Light tasks only |
| Tier 5 | codellama:7b, phi3:mini | Basic, needs significant review | Emergencies only |

**Important:** With Tier 4/5 models, always have a human review ALL generated code before committing.
The human checkpoint after planning becomes especially critical.
