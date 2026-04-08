#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$INFRA_DIR/.." && pwd)"

BRANCH_NAME="${AMPLIFY_BRANCH_NAME:-$(git -C "$REPO_DIR" branch --show-current)}"
ACCESS_TOKEN="${AMPLIFY_GITHUB_APP_ACCESS_TOKEN:-dummy-token}"

cd "$INFRA_DIR"

npx cdk destroy CalculatorStack --force \
  --parameters AmplifyGitHubAccessToken="$ACCESS_TOKEN" \
  --parameters AmplifyBranchName="$BRANCH_NAME"
