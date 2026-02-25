#!/usr/bin/env bash
# ============================================================================
# Rootify AI Task Runner v4 — 2-Phase Execution (Opus Plan → Sonnet Execute)
#
# 処理フロー:
#   1. pending/ のタスクファイルを検出
#   2. Phase 1 (Plan): Opus がコードベースを調査し実装プランを作成
#   3. Phase 2 (Execute): Sonnet がプランに従い TDD で実装
#   4. テスト → コミット → プッシュ → PR 作成
#
# フォルダ構成:
#   queue/pending/   ← タスクファイルを置く
#   queue/running/   ← 実行中（自動移動）
#   queue/done/      ← 完了（自動移動）
#   queue/failed/    ← 失敗（自動移動）
#   plans/           ← Opus が生成した実装プラン（監査用に保存）
#
# タスクファイル形式 (例: 001_add-feature.txt):
#   SCOPE: src/foo.ts, src/__tests__/foo.test.ts
#   Description of what to implement...
#
# 使い方:
#   ./automation/run_tasks.sh          # フォアグラウンド実行
#   nohup ./automation/run_tasks.sh &  # バックグラウンド実行
#   kill -SIGTERM <pid>                # 停止
# ============================================================================
set -uo pipefail

# ── Project Configuration ─────────────────────────────────────────────────
# プロジェクト固有の設定。新プロジェクトへの展開時はここだけ変更する。
# ──────────────────────────────────────────────────────────────────────────
PROJECT_NAME="WordRoot"
BASE_BRANCH="main"
TEST_CMD="npx jest --config jest.config.js --no-watchman --passWithNoTests"

# ── Model Configuration ──────────────────────────────────────────────────
# Phase 1 (Plan):   Opus — アーキテクチャ設計・コード調査に特化
# Phase 2 (Execute): Sonnet — TDD 実装に特化（トークン効率 5x）
# ──────────────────────────────────────────────────────────────────────────
PLAN_MODEL="claude-opus-4-6"
EXECUTE_MODEL="claude-sonnet-4-6"

# ── Execution Parameters ─────────────────────────────────────────────────
PLAN_MAX_TURNS=15              # Plan フェーズの最大ターン数（読み取り中心なので少なめ）
EXECUTE_MAX_TURNS=30           # Execute フェーズの最大ターン数（実装のため多め）
MAX_RETRIES=2                  # テスト失敗時のリトライ上限
POLL_INTERVAL=30               # タスク監視間隔（秒）
RATE_LIMIT_WAIT=300            # レート制限時の待機秒数（5分）
RATE_LIMIT_MAX_RETRIES=60      # レート制限リトライ上限（5分 x 60 = 5時間）

# ── Tool Permissions ─────────────────────────────────────────────────────
PLAN_TOOLS="Read,Glob,Grep,WebFetch,WebSearch"
EXECUTE_TOOLS="Bash,Read,Edit,Write,Glob,Grep"

# ── Path Configuration ───────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
QUEUE_DIR="$SCRIPT_DIR/queue"
PENDING_DIR="$QUEUE_DIR/pending"
RUNNING_DIR="$QUEUE_DIR/running"
DONE_DIR="$QUEUE_DIR/done"
FAILED_DIR="$QUEUE_DIR/failed"
PLAN_DIR="$SCRIPT_DIR/plans"
LOG_DIR="$SCRIPT_DIR/logs"
PLAN_PROMPT_FILE="$SCRIPT_DIR/plan_system_prompt.txt"
EXECUTE_PROMPT_FILE="$SCRIPT_DIR/execute_system_prompt.txt"
CLAUDE_CMD="claude"

# ── Directory Setup ──────────────────────────────────────────────────────
mkdir -p "$PENDING_DIR" "$RUNNING_DIR" "$DONE_DIR" "$FAILED_DIR" \
         "$PLAN_DIR" "$LOG_DIR"

# ══════════════════════════════════════════════════════════════════════════
# Logging
# ══════════════════════════════════════════════════════════════════════════
readonly GREEN='\033[0;32m' RED='\033[0;31m' YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m' MAGENTA='\033[0;35m' BLUE='\033[0;34m' NC='\033[0m'

_log() { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
log_ok()   { _log "${GREEN}✓${NC} $1"; }
log_err()  { _log "${RED}✗${NC} $1"; }
log_warn() { _log "${YELLOW}⚠${NC} $1"; }
log_git()  { _log "${MAGENTA}⎇${NC} $1"; }
log_plan() { _log "${BLUE}📋 [Plan]${NC} $1"; }
log_exec() { _log "${GREEN}🔨 [Exec]${NC} $1"; }

# ══════════════════════════════════════════════════════════════════════════
# Graceful Shutdown
# ══════════════════════════════════════════════════════════════════════════
RUNNING=true
trap 'log_warn "Shutdown signal received."; RUNNING=false' SIGINT SIGTERM

# ══════════════════════════════════════════════════════════════════════════
# Task File Parsing
# ══════════════════════════════════════════════════════════════════════════

get_next_task_file() {
  find "$1" -maxdepth 1 -name '*.txt' -type f 2>/dev/null | sort | head -1
}

# "001_add-feature.txt" → "001"
get_task_id() {
  basename "$1" .txt | sed 's/_.*//'
}

# "001_add-feature.txt" → "add feature"
get_task_title() {
  basename "$1" .txt | sed 's/^[0-9]*_//' | tr '-' ' '
}

# 最初の "SCOPE:" 行の値を取得
get_task_scope() {
  grep -m1 '^SCOPE:' "$1" 2>/dev/null | sed 's/^SCOPE: *//' || echo ""
}

# SCOPE 行以降の本文を取得
get_task_description() {
  awk '
    BEGIN { past_header = 0 }
    /^SCOPE:/ { next }
    /^$/ && !past_header { past_header = 1; next }
    past_header || !/^(SCOPE:|$)/ { past_header = 1; print }
  ' "$1"
}

# ══════════════════════════════════════════════════════════════════════════
# Git Operations
# ══════════════════════════════════════════════════════════════════════════

create_task_branch() {
  local task_id="$1" title="$2"
  local slug
  slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/-/g; s/--*/-/g; s/-$//' | cut -c1-50)
  local branch_name="auto/task-${task_id}-${slug}"

  cd "$PROJECT_DIR"
  git checkout "$BASE_BRANCH" >/dev/null 2>&1 || true
  git pull --rebase origin "$BASE_BRANCH" >/dev/null 2>&1 || true
  git branch -D "$branch_name" >/dev/null 2>&1 || true
  git checkout -b "$branch_name" >/dev/null 2>&1

  log_git "Branch created: ${branch_name}" >&2
  echo "$branch_name"
}

commit_and_push() {
  local task_id="$1" title="$2" branch_name="$3" log_file="$4"

  cd "$PROJECT_DIR"
  git add -A -- ':!automation/queue/' ':!automation/plans/' ':!automation/logs/'

  if git diff --cached --quiet 2>/dev/null; then
    log_warn "No code changes to commit. Skipping."
    return
  fi

  git commit -m "$(cat <<EOF
feat(task-${task_id}): ${title}

Automated 2-phase TDD implementation.
- Plan: Claude Opus 4.6 (architecture & design)
- Execute: Claude Sonnet 4.6 (TDD implementation)
Task ID: ${task_id}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
  )" >> "$log_file" 2>&1

  log_git "Committed on branch: ${branch_name}"

  if git push -u origin "$branch_name" >> "$log_file" 2>&1; then
    log_git "Pushed to origin/${branch_name}"
    create_pull_request "$task_id" "$title" "$branch_name" "$log_file"
  else
    log_warn "Push failed. See log: ${log_file}"
  fi
}

return_to_base() {
  cd "$PROJECT_DIR"
  git checkout "$BASE_BRANCH" >/dev/null 2>&1 || true
}

# ══════════════════════════════════════════════════════════════════════════
# PR Creation
# ══════════════════════════════════════════════════════════════════════════

create_pull_request() {
  local task_id="$1" title="$2" branch_name="$3" log_file="$4"

  if ! command -v gh &>/dev/null; then
    log_warn "gh CLI not found. Skipping PR creation."
    return
  fi

  local plan_file="${PLAN_DIR}/task_${task_id}.md"
  local plan_summary="(plan file not found)"
  if [[ -f "$plan_file" ]]; then
    plan_summary=$(head -50 "$plan_file")
  fi

  local pr_url
  pr_url=$(gh pr create \
    --title "feat(task-${task_id}): ${title}" \
    --body "$(cat <<PREOF
## Summary
Automated 2-phase TDD implementation by ${PROJECT_NAME} AI Task Runner v4.
- **Task ID**: ${task_id}
- **Branch**: \`${branch_name}\`
- **Plan model**: Opus 4.6 (architecture & design)
- **Execute model**: Sonnet 4.6 (TDD implementation)

## Implementation Plan
<details>
<summary>Click to expand the Opus implementation plan</summary>

${plan_summary}
</details>

## Changes
${title}

---
Generated by ${PROJECT_NAME} AI Task Runner v4
PREOF
    )" \
    --base "$BASE_BRANCH" \
    --head "$branch_name" 2>> "$log_file") || true

  if [[ -n "$pr_url" ]]; then
    log_ok "PR created: ${pr_url}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PR: ${pr_url}" >> "$log_file"
  else
    log_warn "PR creation failed. See log: ${log_file}"
  fi
}

# ══════════════════════════════════════════════════════════════════════════
# Rate Limit Handling
# ══════════════════════════════════════════════════════════════════════════

is_rate_limited() {
  echo "$1" | grep -iqE \
    "rate.?limit|too many requests|429|quota.*exceeded|usage.*limit|capacity|overloaded"
}

wait_for_rate_limit() {
  local log_file="$1" model="$2"
  local wait_count=0

  log_warn "Rate limit detected (${model}). Waiting ${RATE_LIMIT_WAIT}s intervals..."

  while [[ $wait_count -lt $RATE_LIMIT_MAX_RETRIES ]] && $RUNNING; do
    wait_count=$((wait_count + 1))
    _log "Rate limit wait ${wait_count}/${RATE_LIMIT_MAX_RETRIES}..."
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rate limit wait ${wait_count}" >> "$log_file"

    sleep "$RATE_LIMIT_WAIT"
    $RUNNING || return 1

    local probe
    probe=$(env -u CLAUDECODE $CLAUDE_CMD -p "Reply with OK" \
      --max-turns 1 --model "$model" --output-format text 2>&1) || true

    if ! is_rate_limited "$probe"; then
      log_ok "Rate limit lifted! Resuming..."
      return 0
    fi
  done

  log_err "Rate limit wait exceeded. Giving up."
  return 1
}

# ══════════════════════════════════════════════════════════════════════════
# Claude Invocation (model-agnostic)
# ══════════════════════════════════════════════════════════════════════════

invoke_claude() {
  local prompt="$1"
  local log_file="$2"
  local model="$3"
  local max_turns="$4"
  local tools="$5"
  local system_prompt_file="$6"

  while $RUNNING; do
    local output
    output=$(env -u CLAUDECODE $CLAUDE_CMD -p "$prompt" \
      --dangerously-skip-permissions \
      --allowedTools "$tools" \
      --append-system-prompt-file "$system_prompt_file" \
      --max-turns "$max_turns" \
      --model "$model" \
      --output-format text \
      2>&1) || true

    echo "$output" >> "$log_file"

    if is_rate_limited "$output"; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rate limit hit (${model})" >> "$log_file"
      if wait_for_rate_limit "$log_file" "$model"; then
        continue
      else
        echo "RATE_LIMIT_FAILED"
        return 1
      fi
    fi

    echo "$output"
    return 0
  done
}

# ══════════════════════════════════════════════════════════════════════════
# Phase 1: Plan (Opus)
# ══════════════════════════════════════════════════════════════════════════

build_plan_prompt() {
  local task_file="$1"
  local title scope description
  title="$(get_task_title "$task_file")"
  scope="$(get_task_scope "$task_file")"
  description="$(get_task_description "$task_file")"

  cat <<PROMPT
## Task: ${title}

### Scope
${scope}

### Description
${description}

### Your Role
You are a senior architect using Opus. Your job is to PLAN, not implement.

### Instructions
1. Read all SCOPE files thoroughly.
2. Read related test files and understand existing patterns.
3. Search the codebase for reusable utilities, patterns, and conventions.
4. If the task mentions web research, use WebSearch/WebFetch to gather information.
5. Produce a detailed implementation plan in Markdown.

### Plan Output Format
Write your plan as a single Markdown document. Include:

#### 1. Analysis
- Current state of the SCOPE files
- Existing patterns and conventions found
- Dependencies and imports to reuse

#### 2. Implementation Steps
Numbered, ordered steps. Each step must specify:
- Which file to modify/create
- What to change (function names, logic, etc.)
- Exact code patterns to follow (reference existing code)

#### 3. Test Strategy
- Test file paths
- Test case descriptions with IDs
- Mocking strategy (what to mock and how, following existing patterns)

#### 4. Edge Cases & Risks
- Potential issues and how to handle them

### Project Context
- Working directory: ${PROJECT_DIR}
- Test command: ${TEST_CMD}
- Existing tests all pass. Plan must not break them.
PROMPT
}

run_plan_phase() {
  local task_file="$1" task_id="$2" log_file="$3"

  local plan_file="${PLAN_DIR}/task_${task_id}.md"
  log_plan "Starting Phase 1 — Opus analyzing codebase..."

  local prompt
  prompt="$(build_plan_prompt "$task_file")"

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Phase 1: Plan (Opus) ===" >> "$log_file"

  local plan_output
  plan_output=$(invoke_claude "$prompt" "$log_file" \
    "$PLAN_MODEL" "$PLAN_MAX_TURNS" "$PLAN_TOOLS" "$PLAN_PROMPT_FILE")

  if [[ "$plan_output" == "RATE_LIMIT_FAILED" ]]; then
    echo "RATE_LIMIT_FAILED"
    return 1
  fi

  # プラン出力をファイルに保存
  echo "$plan_output" > "$plan_file"
  log_plan "Plan saved: ${plan_file}"

  echo "$plan_file"
  return 0
}

# ══════════════════════════════════════════════════════════════════════════
# Phase 2: Execute (Sonnet)
# ══════════════════════════════════════════════════════════════════════════

build_execute_prompt() {
  local task_file="$1" plan_file="$2" retry_context="$3"
  local title scope description plan_content
  title="$(get_task_title "$task_file")"
  scope="$(get_task_scope "$task_file")"
  description="$(get_task_description "$task_file")"
  plan_content="$(cat "$plan_file")"

  local prompt
  prompt="$(cat <<PROMPT
## Task: ${title}

### Scope
${scope}

### Description
${description}

### Implementation Plan (from Opus Architect)
Follow this plan precisely. Do NOT deviate unless you find a clear error.

${plan_content}

### Project Context
- Working directory: ${PROJECT_DIR}
- Test command: ${TEST_CMD} --no-coverage
- All existing tests pass. Do NOT break them.
PROMPT
  )"

  if [[ -n "$retry_context" ]]; then
    prompt="${prompt}

### RETRY: Previous attempt had test failures. Fix them.
\`\`\`
${retry_context}
\`\`\`"
  fi

  echo "$prompt"
}

run_execute_phase() {
  local task_file="$1" plan_file="$2" log_file="$3"
  local retry=0 test_output="" success=false

  while [[ $retry -le $MAX_RETRIES ]] && $RUNNING; do
    log_exec "Sonnet implementing (attempt $((retry + 1))/$((MAX_RETRIES + 1)))..."
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Phase 2: Execute attempt $((retry + 1)) ===" >> "$log_file"

    local prompt
    prompt="$(build_execute_prompt "$task_file" "$plan_file" "$test_output")"

    local exec_output
    exec_output=$(invoke_claude "$prompt" "$log_file" \
      "$EXECUTE_MODEL" "$EXECUTE_MAX_TURNS" "$EXECUTE_TOOLS" "$EXECUTE_PROMPT_FILE")

    if [[ "$exec_output" == "RATE_LIMIT_FAILED" ]]; then
      echo "RATE_LIMIT_FAILED"
      return 1
    fi

    # テスト実行
    log_exec "Running test suite..."
    test_output="$(cd "$PROJECT_DIR" && $TEST_CMD --no-coverage 2>&1)" || true
    echo "$test_output" >> "$log_file"

    if echo "$test_output" | grep -q "Tests:.*failed"; then
      local fail_info
      fail_info=$(echo "$test_output" | grep -E "(Tests:|Test Suites:)" | head -2)
      log_err "Tests FAILED: $fail_info"
      retry=$((retry + 1))
      test_output=$(echo "$test_output" | tail -100)
    elif echo "$test_output" | grep -q "Tests:.*passed"; then
      local pass_info
      pass_info=$(echo "$test_output" | grep -E "(Tests:|Test Suites:)" | head -2)
      log_ok "All tests PASSED: $pass_info"
      success=true
      break
    else
      log_warn "Test result unclear. Treating as failure."
      retry=$((retry + 1))
    fi
  done

  $success && return 0 || return 1
}

# ══════════════════════════════════════════════════════════════════════════
# Run Tests
# ══════════════════════════════════════════════════════════════════════════

run_tests() {
  cd "$PROJECT_DIR"
  $TEST_CMD --no-coverage 2>&1
}

# ══════════════════════════════════════════════════════════════════════════
# Pre-flight Checks
# ══════════════════════════════════════════════════════════════════════════

preflight() {
  local errors=0
  _log "Running pre-flight checks..."

  # Claude CLI
  if command -v "$CLAUDE_CMD" &>/dev/null; then
    log_ok "Claude CLI: $($CLAUDE_CMD --version 2>/dev/null || echo unknown)"
  else
    log_err "Claude CLI not found."; errors=$((errors + 1))
  fi

  # Queue directories
  for dir in "$PENDING_DIR" "$RUNNING_DIR" "$DONE_DIR" "$FAILED_DIR"; do
    [[ -d "$dir" ]] || { log_err "Missing: $dir"; errors=$((errors + 1)); }
  done
  log_ok "Queue directories OK"

  # Pending / running counts
  local pending running
  pending=$(find "$PENDING_DIR" -maxdepth 1 -name '*.txt' -type f | wc -l | tr -d ' ')
  running=$(find "$RUNNING_DIR" -maxdepth 1 -name '*.txt' -type f | wc -l | tr -d ' ')
  log_ok "Pending: $pending task(s)"
  [[ "$running" -gt 0 ]] && log_warn "Found $running interrupted task(s) in running/."

  # System prompts
  for pf in "$PLAN_PROMPT_FILE" "$EXECUTE_PROMPT_FILE"; do
    if [[ -f "$pf" ]]; then
      log_ok "Prompt: $(basename "$pf")"
    else
      log_err "Missing: $pf"; errors=$((errors + 1))
    fi
  done

  # Git
  if git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree &>/dev/null; then
    log_ok "Git: $(git -C "$PROJECT_DIR" branch --show-current)"
  else
    log_err "Not a git repo: $PROJECT_DIR"; errors=$((errors + 1))
  fi

  # Remote
  if git -C "$PROJECT_DIR" remote get-url origin &>/dev/null; then
    log_ok "Remote: $(git -C "$PROJECT_DIR" remote get-url origin)"
  else
    log_warn "No remote 'origin'. Push will be skipped."
  fi

  # gh CLI
  command -v gh &>/dev/null && log_ok "gh CLI: available" || log_warn "gh CLI not found."

  # Node
  if command -v npx &>/dev/null; then
    log_ok "Node: $(node --version)"
  else
    log_err "npx not found"; errors=$((errors + 1))
  fi

  # Existing tests
  _log "Running existing test suite..."
  local test_out
  test_out="$(cd "$PROJECT_DIR" && $TEST_CMD --no-coverage --silent 2>&1)" || true
  if echo "$test_out" | grep -q "Tests:.*failed"; then
    log_err "Existing tests are failing!"; errors=$((errors + 1))
  else
    log_ok "Tests: $(echo "$test_out" | grep 'Tests:' | head -1)"
  fi

  if [[ $errors -gt 0 ]]; then
    log_err "Pre-flight failed ($errors error(s)). Aborting."
    exit 1
  fi

  log_ok "All pre-flight checks passed."
  echo ""
}

# ══════════════════════════════════════════════════════════════════════════
# Main Loop
# ══════════════════════════════════════════════════════════════════════════

main() {
  cat <<BANNER

  ╔══════════════════════════════════════════════╗
  ║  ${PROJECT_NAME} AI Task Runner v4                  ║
  ║  Phase 1: Opus (Plan) → Phase 2: Sonnet (Execute)  ║
  ║  pending/ → branch → plan → implement → PR  ║
  ╚══════════════════════════════════════════════╝

BANNER

  preflight

  _log "Watching: $PENDING_DIR"
  _log "Plan: ${PLAN_MODEL} (${PLAN_MAX_TURNS} turns) | Execute: ${EXECUTE_MODEL} (${EXECUTE_MAX_TURNS} turns)"
  _log "Poll: ${POLL_INTERVAL}s | Retries: ${MAX_RETRIES}"
  echo ""

  while $RUNNING; do
    # 中断タスク優先 → 新規タスク
    local task_file is_resume=false
    task_file="$(get_next_task_file "$RUNNING_DIR")"
    if [[ -n "$task_file" ]]; then
      is_resume=true
    else
      task_file="$(get_next_task_file "$PENDING_DIR")"
    fi

    if [[ -z "$task_file" ]]; then
      _log "No tasks. Sleeping ${POLL_INTERVAL}s..."
      sleep "$POLL_INTERVAL"
      continue
    fi

    # タスク情報の抽出
    local task_filename task_id title scope timestamp log_file
    task_filename="$(basename "$task_file")"
    task_id="$(get_task_id "$task_file")"
    title="$(get_task_title "$task_file")"
    scope="$(get_task_scope "$task_file")"
    timestamp="$(date +%Y%m%d_%H%M%S)"
    log_file="${LOG_DIR}/task_${task_id}_${timestamp}.log"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if $is_resume; then
      _log "Resuming: ${task_filename}"
    else
      _log "Starting: ${task_filename}"
      mv "$task_file" "$RUNNING_DIR/$task_filename"
      task_file="$RUNNING_DIR/$task_filename"
    fi
    _log "Title: ${title} | Scope: ${scope}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # ── ブランチ作成 ──
    local branch_name
    branch_name="$(create_task_branch "$task_id" "$title")"

    # ── Phase 1: Plan (Opus) ──
    local plan_result
    plan_result=$(run_plan_phase "$task_file" "$task_id" "$log_file")

    if [[ "$plan_result" == "RATE_LIMIT_FAILED" ]]; then
      log_err "Rate limit in Plan phase. Returning to pending."
      mv "$task_file" "$PENDING_DIR/$task_filename"
      return_to_base
      continue
    fi

    local plan_file="$plan_result"
    log_plan "Phase 1 complete."

    # ── Phase 2: Execute (Sonnet) ──
    local exec_success=false
    if run_execute_phase "$task_file" "$plan_file" "$log_file"; then
      exec_success=true
    fi

    # ── 結果処理 ──
    if $exec_success; then
      commit_and_push "$task_id" "$title" "$branch_name" "$log_file"
      mv "$task_file" "$DONE_DIR/$task_filename"
      log_ok "Task DONE: ${task_filename}"
      return_to_base
    else
      mv "$task_file" "$FAILED_DIR/$task_filename"
      log_err "Task FAILED: ${task_filename} (after $((MAX_RETRIES + 1)) attempts)"
      log_err "Log: $log_file"
      return_to_base
    fi

    echo ""
  done

  _log "Task runner shut down."
}

# ══════════════════════════════════════════════════════════════════════════
# Entry Point
# ══════════════════════════════════════════════════════════════════════════
main
