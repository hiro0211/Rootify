#!/usr/bin/env bash
# ============================================================================
# Rootify 自律タスク実行スクリプト (AI 現場監督) v3
#
# queue/pending/ フォルダ内の .txt ファイルをタスクとして順番に実行。
# ファイルを置くだけでタスク追加完了。
#
# フォルダ構成:
#   queue/pending/   ← タスクファイルを置く
#   queue/running/   ← 実行中（自動移動）
#   queue/done/      ← 完了（自動移動）
#   queue/failed/    ← 失敗（自動移動）
#
# タスクファイル形式 (例: 001_add-feature.txt):
#   SCOPE: src/foo.ts, __tests__/foo.test.ts
#
#   Description of what to implement...
#
# 使い方:
#   ./automation/run_tasks.sh          # フォアグラウンド実行
#   nohup ./automation/run_tasks.sh &  # バックグラウンド実行
#   kill -SIGTERM <pid>                # 停止
# ============================================================================
set -uo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
QUEUE_DIR="$SCRIPT_DIR/queue"
PENDING_DIR="$QUEUE_DIR/pending"
RUNNING_DIR="$QUEUE_DIR/running"
DONE_DIR="$QUEUE_DIR/done"
FAILED_DIR="$QUEUE_DIR/failed"
LOG_DIR="$SCRIPT_DIR/logs"
SYSTEM_PROMPT_FILE="$SCRIPT_DIR/tdd_system_prompt.txt"

MAX_RETRIES=2
MAX_TURNS=30
POLL_INTERVAL=30
RATE_LIMIT_WAIT=300          # レート制限時の待機秒数（5分）
RATE_LIMIT_MAX_RETRIES=60    # 最大リトライ回数（5分×60=5時間）
ALLOWED_TOOLS="Bash,Read,Edit,Write,Glob,Grep,WebFetch,WebSearch"
CLAUDE_CMD="claude"
MODEL="claude-opus-4-6"
BASE_BRANCH="main"

# ── Setup ──────────────────────────────────────────────────────────────────
mkdir -p "$PENDING_DIR" "$RUNNING_DIR" "$DONE_DIR" "$FAILED_DIR" "$LOG_DIR"

# ── Colors ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ── Logging ────────────────────────────────────────────────────────────────
log() {
  echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_ok() {
  echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${GREEN}✓${NC} $1"
}

log_err() {
  echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${RED}✗${NC} $1"
}

log_warn() {
  echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${YELLOW}⚠${NC} $1"
}

log_git() {
  echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ${MAGENTA}⎇${NC} $1"
}

# ── Graceful shutdown ──────────────────────────────────────────────────────
RUNNING=true
cleanup() {
  log_warn "Shutdown signal received. Finishing current step..."
  RUNNING=false
}
trap cleanup SIGINT SIGTERM

# ── Task file parsing ─────────────────────────────────────────────────────

# Get the next task file from a directory (sorted by filename)
get_next_task_file() {
  local dir="$1"
  # Sort by filename (numeric prefix ensures order)
  local file
  file=$(find "$dir" -maxdepth 1 -name '*.txt' -type f | sort | head -1)
  echo "$file"
}

# Extract task ID from filename (e.g., "001_add-feature.txt" → "001")
get_task_id() {
  local filepath="$1"
  local filename
  filename="$(basename "$filepath" .txt)"
  echo "$filename" | sed 's/_.*//'
}

# Extract title from filename (e.g., "001_add-feature.txt" → "add-feature")
get_task_title_from_filename() {
  local filepath="$1"
  local filename
  filename="$(basename "$filepath" .txt)"
  # Remove leading number and underscore, replace hyphens with spaces
  echo "$filename" | sed 's/^[0-9]*_//' | tr '-' ' '
}

# Extract SCOPE from task file (first line starting with "SCOPE:")
get_task_scope() {
  local filepath="$1"
  grep -m1 '^SCOPE:' "$filepath" 2>/dev/null | sed 's/^SCOPE: *//' || echo ""
}

# Extract description from task file (everything after the first blank line)
get_task_description() {
  local filepath="$1"
  # Skip SCOPE line and blank lines at the top, return the rest
  awk '
    BEGIN { found_blank = 0 }
    /^SCOPE:/ { next }
    /^$/ && !found_blank { found_blank = 1; next }
    found_blank || !/^(SCOPE:|$)/ { found_blank = 1; print }
  ' "$filepath"
}

# ── Git helpers ────────────────────────────────────────────────────────────

create_task_branch() {
  local task_id="$1"
  local title="$2"
  local branch_name="auto/task-${task_id}-$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/-$//' | cut -c1-50)"

  cd "$PROJECT_DIR"

  # All git/log output goes to stderr so only the branch name goes to stdout
  git checkout "$BASE_BRANCH" >/dev/null 2>&1 || true
  git pull --rebase origin "$BASE_BRANCH" >/dev/null 2>&1 || true

  # Delete old branch if it exists (prevents stale state)
  git branch -D "$branch_name" >/dev/null 2>&1 || true

  git checkout -b "$branch_name" >/dev/null 2>&1
  log_git "Branch created: ${branch_name}" >&2
  echo "$branch_name"
}

commit_and_push() {
  local task_id="$1"
  local title="$2"
  local branch_name="$3"
  local log_file="$4"

  cd "$PROJECT_DIR"

  # Add all changes EXCEPT the queue directory
  git add -A -- ':!automation/queue/'

  # Check if there are staged changes to commit
  if ! git diff --cached --quiet 2>/dev/null; then
    git commit -m "$(cat <<EOF
feat(task-${task_id}): ${title}

Automated TDD implementation by Claude Code CLI.
Task ID: ${task_id}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
    )" >> "$log_file" 2>&1

    log_git "Committed on branch: ${branch_name}"

    if git push -u origin "$branch_name" >> "$log_file" 2>&1; then
      log_git "Pushed to origin/${branch_name}"
      # PR 自動作成
      create_pull_request "$task_id" "$title" "$branch_name" "$log_file"
    else
      log_warn "Push failed. See log: ${log_file}"
    fi
  else
    log_warn "No code changes to commit. Skipping."
  fi
}

return_to_base() {
  cd "$PROJECT_DIR"
  git checkout "$BASE_BRANCH" >/dev/null 2>&1 || true
}

# ── PR creation ──────────────────────────────────────────────────────────

create_pull_request() {
  local task_id="$1"
  local title="$2"
  local branch_name="$3"
  local log_file="$4"

  if ! command -v gh &>/dev/null; then
    log_warn "gh CLI not found. Skipping PR creation."
    return
  fi

  local pr_url
  pr_url=$(gh pr create \
    --title "feat(task-${task_id}): ${title}" \
    --body "$(cat <<PREOF
## Summary
Automated TDD implementation by Rootify AI Task Runner v3.
- **Task ID**: ${task_id}
- **Branch**: \`${branch_name}\`

## Changes
${title}

---
Generated by Rootify AI Task Runner v3
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

# ── Rate limit handling ────────────────────────────────────────────────────

is_rate_limited() {
  local output="$1"
  if echo "$output" | grep -iqE "rate.?limit|too many requests|429|quota.*exceeded|usage.*limit|capacity|overloaded"; then
    return 0
  fi
  return 1
}

wait_for_rate_limit() {
  local log_file="$1"
  local wait_count=0

  log_warn "Rate limit detected. Entering wait mode..."
  log_warn "Will retry every ${RATE_LIMIT_WAIT}s (max ${RATE_LIMIT_MAX_RETRIES} times)"

  while [[ $wait_count -lt $RATE_LIMIT_MAX_RETRIES ]] && $RUNNING; do
    wait_count=$((wait_count + 1))
    local next_try
    next_try=$(date -v+${RATE_LIMIT_WAIT}S '+%H:%M:%S' 2>/dev/null || date -d "+${RATE_LIMIT_WAIT} seconds" '+%H:%M:%S' 2>/dev/null || echo "~${RATE_LIMIT_WAIT}s later")
    log "Waiting for rate limit reset... (${wait_count}/${RATE_LIMIT_MAX_RETRIES}) Next try: ${next_try}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rate limit wait ${wait_count}/${RATE_LIMIT_MAX_RETRIES}" >> "$log_file"

    sleep "$RATE_LIMIT_WAIT"

    if ! $RUNNING; then
      return 1
    fi

    local probe_output
    probe_output=$($CLAUDE_CMD -p "Reply with OK" \
      --max-turns 1 \
      --model "$MODEL" \
      --output-format text \
      2>&1) || true

    if ! is_rate_limited "$probe_output"; then
      log_ok "Rate limit lifted! Resuming..."
      return 0
    fi

    log "Still rate limited. Continuing to wait..."
  done

  log_err "Rate limit wait exceeded max retries. Giving up."
  return 1
}

# ── Invoke Claude with rate limit retry ────────────────────────────────────

invoke_claude() {
  local prompt="$1"
  local log_file="$2"

  while $RUNNING; do
    local claude_output
    claude_output=$($CLAUDE_CMD -p "$prompt" \
      --dangerously-skip-permissions \
      --allowedTools "$ALLOWED_TOOLS" \
      --append-system-prompt-file "$SYSTEM_PROMPT_FILE" \
      --max-turns "$MAX_TURNS" \
      --model "$MODEL" \
      --output-format text \
      2>&1) || true

    echo "$claude_output" >> "$log_file"

    if is_rate_limited "$claude_output"; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rate limit hit during Claude invocation" >> "$log_file"

      if wait_for_rate_limit "$log_file"; then
        log "Retrying Claude invocation after rate limit..."
        continue
      else
        echo "RATE_LIMIT_FAILED"
        return 1
      fi
    fi

    echo "$claude_output"
    return 0
  done
}

# ── Build prompt ───────────────────────────────────────────────────────────
build_prompt() {
  local task_file="$1"
  local retry_context="$2"

  local title
  title="$(get_task_title_from_filename "$task_file")"
  local scope
  scope="$(get_task_scope "$task_file")"
  local description
  description="$(get_task_description "$task_file")"

  local prompt="## Task: ${title}

### Scope (files to create/modify)
${scope}

### Description
${description}

### Project context
- Working directory: ${PROJECT_DIR}
- Test command: npx jest --config jest.config.js --no-watchman --passWithNoTests
- All existing tests currently pass. Do NOT break any existing test.
- Follow existing code patterns in src/ and app/.
- This is an Expo Router project with TypeScript strict mode.
- State management: Zustand
- Styling: React Native StyleSheet + expo-linear-gradient
- Testing: ts-jest with node environment
- Path alias: @/* maps to ./*
"

  if [[ -n "$retry_context" ]]; then
    prompt="${prompt}

### RETRY: Previous attempt had test failures. Fix them.

\`\`\`
${retry_context}
\`\`\`
"
  fi

  echo "$prompt"
}

# ── Run tests ──────────────────────────────────────────────────────────────
run_tests() {
  cd "$PROJECT_DIR"
  npx jest --config jest.config.js --no-watchman --passWithNoTests --no-coverage 2>&1
}

# ── Pre-flight checks ─────────────────────────────────────────────────────
preflight() {
  local errors=0

  log "Running pre-flight checks..."

  # Claude CLI
  if ! command -v "$CLAUDE_CMD" &>/dev/null; then
    log_err "Claude CLI not found. Install: npm install -g @anthropic-ai/claude-code"
    errors=$((errors + 1))
  else
    local ver
    ver=$($CLAUDE_CMD --version 2>/dev/null || echo "unknown")
    log_ok "Claude CLI: $ver"
  fi

  # Queue directories
  for dir in "$PENDING_DIR" "$RUNNING_DIR" "$DONE_DIR" "$FAILED_DIR"; do
    if [[ ! -d "$dir" ]]; then
      log_err "Queue directory not found: $dir"
      errors=$((errors + 1))
    fi
  done
  log_ok "Queue: $QUEUE_DIR (pending/running/done/failed)"

  # Count pending tasks
  local pending_count
  pending_count=$(find "$PENDING_DIR" -maxdepth 1 -name '*.txt' -type f | wc -l | tr -d ' ')
  log_ok "Pending tasks: $pending_count"

  # Check for interrupted tasks in running/
  local running_count
  running_count=$(find "$RUNNING_DIR" -maxdepth 1 -name '*.txt' -type f | wc -l | tr -d ' ')
  if [[ "$running_count" -gt 0 ]]; then
    log_warn "Found $running_count interrupted task(s) in running/. Will resume."
  fi

  # System prompt
  if [[ ! -f "$SYSTEM_PROMPT_FILE" ]]; then
    log_err "System prompt not found: $SYSTEM_PROMPT_FILE"
    errors=$((errors + 1))
  else
    log_ok "System prompt: $SYSTEM_PROMPT_FILE"
  fi

  # Git repo
  if ! git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree &>/dev/null; then
    log_err "$PROJECT_DIR is not a git repository"
    errors=$((errors + 1))
  else
    log_ok "Git repo: $(git -C "$PROJECT_DIR" branch --show-current)"
  fi

  # GitHub remote
  if git -C "$PROJECT_DIR" remote get-url origin &>/dev/null; then
    local remote_url
    remote_url=$(git -C "$PROJECT_DIR" remote get-url origin)
    log_ok "Remote: $remote_url"
  else
    log_warn "No remote 'origin' configured. Push will be skipped."
  fi

  # gh CLI
  if command -v gh &>/dev/null; then
    log_ok "gh CLI: available"
  else
    log_warn "gh CLI not found. Auto PR creation disabled."
  fi

  # Node/npx
  if ! command -v npx &>/dev/null; then
    log_err "npx not found"
    errors=$((errors + 1))
  else
    log_ok "Node: $(node --version)"
  fi

  # Existing tests pass
  log "Running existing test suite..."
  local test_output
  test_output="$(cd "$PROJECT_DIR" && npx jest --config jest.config.js --no-watchman --passWithNoTests --no-coverage --silent 2>&1)" || true
  if echo "$test_output" | grep -q "Tests:.*failed"; then
    log_err "Existing tests are failing. Fix before starting."
    echo "$test_output" | tail -5
    errors=$((errors + 1))
  else
    local test_count
    test_count=$(echo "$test_output" | grep "Tests:" | head -1)
    log_ok "Tests: $test_count"
  fi

  if [[ $errors -gt 0 ]]; then
    log_err "Pre-flight failed with $errors error(s). Aborting."
    exit 1
  fi

  log_ok "All pre-flight checks passed."
  echo ""
}

# ── Main loop ──────────────────────────────────────────────────────────────
main() {
  echo ""
  echo "============================================"
  echo "  Rootify AI Task Runner (現場監督) v3"
  echo "  Folder Queue → Branch → Commit → Push → PR"
  echo "============================================"
  echo ""

  preflight

  log "Watching for tasks in: $PENDING_DIR"
  log "Base branch: ${BASE_BRANCH} | Poll: ${POLL_INTERVAL}s | Max retries: ${MAX_RETRIES}"
  log "Rate limit wait: ${RATE_LIMIT_WAIT}s x ${RATE_LIMIT_MAX_RETRIES} max"
  echo ""

  while $RUNNING; do
    # First check for interrupted tasks in running/
    local task_file
    task_file="$(get_next_task_file "$RUNNING_DIR")"

    local is_resume=false
    if [[ -n "$task_file" ]]; then
      is_resume=true
    else
      # Then check for new pending tasks
      task_file="$(get_next_task_file "$PENDING_DIR")"
    fi

    if [[ -z "$task_file" ]]; then
      log "No tasks. Sleeping ${POLL_INTERVAL}s..."
      sleep "$POLL_INTERVAL"
      continue
    fi

    local task_filename
    task_filename="$(basename "$task_file")"
    local task_id
    task_id="$(get_task_id "$task_file")"
    local title
    title="$(get_task_title_from_filename "$task_file")"
    local scope
    scope="$(get_task_scope "$task_file")"
    local timestamp
    timestamp="$(date +%Y%m%d_%H%M%S)"
    local log_file="${LOG_DIR}/task_${task_id}_${timestamp}.log"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if $is_resume; then
      log "Resuming interrupted task: ${task_filename}"
    else
      log "Starting task: ${task_filename}"
      # Move to running/
      mv "$task_file" "$RUNNING_DIR/$task_filename"
      task_file="$RUNNING_DIR/$task_filename"
    fi
    log "Title: ${title}"
    log "Scope: ${scope}"
    log "Log: ${log_file}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # ── Create feature branch ──
    local branch_name
    branch_name="$(create_task_branch "$task_id" "$title")"

    local retry=0
    local test_output=""
    local success=false

    while [[ $retry -le $MAX_RETRIES ]] && $RUNNING; do
      local prompt
      prompt="$(build_prompt "$task_file" "$test_output")"

      log "Invoking Claude (attempt $((retry + 1))/$((MAX_RETRIES + 1)))..."
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Claude invocation attempt $((retry + 1)) ===" >> "$log_file"

      # ── Invoke Claude with rate limit handling ──
      local claude_result
      claude_result=$(invoke_claude "$prompt" "$log_file")

      if [[ "$claude_result" == "RATE_LIMIT_FAILED" ]]; then
        log_err "Rate limit could not be resolved. Returning task to pending."
        # Move back to pending for auto-resume
        mv "$task_file" "$PENDING_DIR/$task_filename"
        return_to_base
        break
      fi

      # ── Run full test suite ──
      log "Running test suite..."
      test_output="$(run_tests 2>&1)" || true
      echo "$test_output" >> "$log_file"

      if echo "$test_output" | grep -q "Tests:.*failed"; then
        local fail_info
        fail_info=$(echo "$test_output" | grep -E "(Tests:|Test Suites:)" | head -2)
        log_err "Tests FAILED (attempt $((retry + 1))): $fail_info"
        retry=$((retry + 1))
        test_output=$(echo "$test_output" | tail -100)
      elif echo "$test_output" | grep -q "Tests:.*passed"; then
        local pass_info
        pass_info=$(echo "$test_output" | grep -E "(Tests:|Test Suites:)" | head -2)
        log_ok "All tests PASSED: $pass_info"
        success=true
        break
      else
        log_warn "Could not determine test result. Treating as failure."
        retry=$((retry + 1))
      fi
    done

    if $success; then
      # ── Commit & Push ──
      commit_and_push "$task_id" "$title" "$branch_name" "$log_file"

      # Move to done/
      mv "$task_file" "$DONE_DIR/$task_filename"
      log_ok "Task DONE: ${task_filename} → done/"

      return_to_base
    elif [[ "$claude_result" == "RATE_LIMIT_FAILED" ]]; then
      # Already moved back to pending above
      :
    else
      # Move to failed/
      mv "$task_file" "$FAILED_DIR/$task_filename"
      log_err "Task FAILED: ${task_filename} → failed/ (after $((MAX_RETRIES + 1)) attempts)"
      log_err "See: $log_file"
      return_to_base
    fi

    echo ""
  done

  log "Task runner shut down."
}

# ── Entry point ────────────────────────────────────────────────────────────
main
