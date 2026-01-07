#!/usr/bin/env bash

# StackKit CLI Test Script
# This script tests all major functionality of the CLI

set -e

echo "🚀 Starting StackKit CLI Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((TESTS_PASSED++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((TESTS_FAILED++))
}

info() {
  echo -e "${YELLOW}ℹ${NC} $1"
}

# Get the CLI path
CLI_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACKKIT_CLI="node $CLI_PATH/apps/stackkit-cli/dist/index.js"

# Test directory
TEST_DIR="/tmp/stackkit-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "Test directory: $TEST_DIR"
echo ""

# Test 1: Help command
info "Test 1: Help command"
if $STACKKIT_CLI --help > /dev/null 2>&1; then
  pass "Help command works"
else
  fail "Help command failed"
fi

# Test 2: Version command
info "Test 2: Version command"
if $STACKKIT_CLI --version > /dev/null 2>&1; then
  pass "Version command works"
else
  fail "Version command failed"
fi

# Test 3: List command
info "Test 3: List command"
if $STACKKIT_CLI list > /dev/null 2>&1; then
  pass "List command works"
else
  fail "List command failed"
fi

# Test 4: List templates only
info "Test 4: List templates"
if $STACKKIT_CLI list --templates > /dev/null 2>&1; then
  pass "List templates works"
else
  fail "List templates failed"
fi

# Test 5: List modules only
info "Test 5: List modules"
if $STACKKIT_CLI list --modules > /dev/null 2>&1; then
  pass "List modules works"
else
  fail "List modules failed"
fi

# Test 6: Init with all flags
info "Test 6: Init project with flags"
PROJECT_NAME="test-project-1"
if $STACKKIT_CLI init "$PROJECT_NAME" --template next-prisma-postgres-shadcn --pm pnpm --no-install --no-git --yes > /dev/null 2>&1; then
  if [ -d "$PROJECT_NAME" ]; then
    pass "Init with flags works"
  else
    fail "Init created no directory"
  fi
else
  fail "Init command failed"
fi

# Test 7: Check project structure
info "Test 7: Check project structure"
if [ -f "$PROJECT_NAME/package.json" ] && \
   [ -f "$PROJECT_NAME/tsconfig.json" ] && \
   [ -d "$PROJECT_NAME/app" ] && \
   [ -d "$PROJECT_NAME/lib" ]; then
  pass "Project structure is correct"
else
  fail "Project structure is incorrect"
fi

# Test 8: Check package name was updated
info "Test 8: Check package name"
PACKAGE_NAME=$(grep '"name"' "$PROJECT_NAME/package.json" | head -n 1 | cut -d'"' -f4)
if [ "$PACKAGE_NAME" == "$PROJECT_NAME" ]; then
  pass "Package name updated correctly"
else
  fail "Package name not updated (got: $PACKAGE_NAME)"
fi

# Test 9: Add module with dry-run
info "Test 9: Add auth with dry-run"
cd "$PROJECT_NAME"
if $STACKKIT_CLI add auth --dry-run --no-install > /dev/null 2>&1; then
  pass "Add auth dry-run works"
else
  fail "Add auth dry-run failed"
fi

# Test 10: Add module for real
info "Test 10: Add auth module"
if $STACKKIT_CLI add auth --no-install > /dev/null 2>&1; then
  pass "Add auth works"
else
  fail "Add auth failed"
fi

# Test 11: Check auth files created
info "Test 11: Check auth files"
if [ -f "app/api/auth/[...nextauth]/route.ts" ] && \
   [ -f "lib/auth.ts" ]; then
  pass "Auth files created"
else
  fail "Auth files not created"
fi

# Test 12: Check env variables added
info "Test 12: Check environment variables"
if grep -q "NEXTAUTH_URL" ".env.example" && \
   grep -q "NEXTAUTH_SECRET" ".env.example"; then
  pass "Environment variables added"
else
  fail "Environment variables not added"
fi

# Test 13: Test idempotency
info "Test 13: Test idempotency (add auth again)"
if $STACKKIT_CLI add auth --no-install > /dev/null 2>&1; then
  # Check that env vars are not duplicated
  NEXTAUTH_COUNT=$(grep -c "NEXTAUTH_URL" ".env.example")
  if [ "$NEXTAUTH_COUNT" == "1" ]; then
    pass "Idempotency works (no duplicates)"
  else
    fail "Idempotency failed (found $NEXTAUTH_COUNT NEXTAUTH_URL entries)"
  fi
else
  fail "Second add auth failed"
fi

# Test 14: Invalid template name
info "Test 14: Invalid template name"
cd "$TEST_DIR"
if $STACKKIT_CLI init test-invalid --template invalid-template --yes > /dev/null 2>&1; then
  fail "Should fail with invalid template"
else
  pass "Correctly rejects invalid template"
fi

# Test 15: Invalid package manager
info "Test 15: Invalid package manager"
if $STACKKIT_CLI init test-invalid-pm --pm invalidpm --yes > /dev/null 2>&1; then
  fail "Should fail with invalid package manager"
else
  pass "Correctly rejects invalid package manager"
fi

# Summary
echo ""
echo "================================"
echo "Test Results"
echo "================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

# Cleanup
info "Cleaning up test directory: $TEST_DIR"
cd /
rm -rf "$TEST_DIR"

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
