#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(cd "$INFRA_DIR/.." && pwd)"

REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region)}}"
BRANCH_NAME="${AMPLIFY_BRANCH_NAME:-$(git -C "$REPO_DIR" branch --show-current)}"
ACCESS_TOKEN="${AMPLIFY_GITHUB_APP_ACCESS_TOKEN:-}"

if [[ -z "$REGION" ]]; then
  echo "AWS region is not configured. Set AWS_REGION or run 'aws configure'." >&2
  exit 1
fi

if [[ -z "$BRANCH_NAME" ]]; then
  echo "Could not determine the current git branch. Set AMPLIFY_BRANCH_NAME." >&2
  exit 1
fi

if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "AMPLIFY_GITHUB_APP_ACCESS_TOKEN is required." >&2
  echo "Install the Amplify GitHub App for $REGION first:" >&2
  echo "https://github.com/apps/aws-amplify-$REGION/installations/new" >&2
  echo "Then generate a GitHub personal access token with admin:repo_hook and export it as AMPLIFY_GITHUB_APP_ACCESS_TOKEN." >&2
  exit 1
fi

cd "$INFRA_DIR"

npx cdk deploy --require-approval never \
  --parameters AmplifyGitHubAccessToken="$ACCESS_TOKEN" \
  --parameters AmplifyBranchName="$BRANCH_NAME"
