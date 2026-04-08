# Sprint P6: Deployment Plan

## 1. Frontend Deployment

### Objective
Deploy the production frontend to AWS Amplify, connect it to the deployed API Gateway endpoint, and validate end-to-end behavior through integration tests in CI.

### Key Tasks
- Configure AWS Amplify app connected to the GitHub repository and `main` branch for production hosting.
- Add Amplify build settings (`npm ci`, `npm run build`) and artifact path configuration for the Vite frontend.
- Define environment variables in Amplify (for example `VITE_API_BASE_URL`) pointing to API Gateway REST API stages.
- Set up preview deployments for pull requests using Amplify branch-based environments.
- Implement frontend-to-backend integration tests (critical user flows and API error-path checks) executed in GitHub Actions.
- Add GitHub branch protection rules for `main`:
  - required pull request reviews,
  - required status checks (lint, unit tests, integration tests, build),
  - no direct pushes to `main`.
- Enforce sprint policy: **no direct code edits — only prompt-based modifications** for deployment and test updates.

### Deliverables
- AWS Amplify production URL and successful build history.
- Amplify environment configuration document (variables, branch mapping, build spec).
- GitHub Actions workflow for frontend build + integration test gating.
- Branch protection configuration screenshot or documented settings.

### Risks & Mitigations
- Risk: Incorrect API base URL causes runtime failures.
  - Mitigation: Validate `VITE_API_BASE_URL` in CI with a health-check integration test before deploy.
- Risk: Amplify build inconsistencies across branches.
  - Mitigation: Use a single committed build configuration and lock dependencies with `npm ci`.
- Risk: Unreviewed deployment changes reach production.
  - Mitigation: Enforce protected branches and required checks in GitHub.

## 2. Backend Deployment

### Objective
Deploy the backend as AWS Lambda functions behind Amazon API Gateway (REST API), with repeatable CI/CD and production-safe release controls.

### Key Tasks
- Package backend for AWS Lambda runtime (Node.js), including environment-specific configuration handling.
- Create API Gateway REST API routes and methods mapped to Lambda integrations.
- Configure Lambda IAM execution roles with least-privilege permissions.
- Enable API Gateway stage deployment (`dev`, `prod`) and route-level logging/metrics.
- Add CORS configuration in API Gateway and backend responses for frontend compatibility.
- Add health endpoint and smoke test endpoint for deployment verification.
- Build GitHub Actions workflow for backend CI/CD:
  - run lint + unit tests,
  - package Lambda artifact,
  - deploy Lambda + API Gateway stage (using AWS credentials from GitHub Secrets/OIDC),
  - run post-deploy smoke tests.
- Define rollback procedure (revert to previous Lambda version/alias and redeploy previous API stage config).
- Enforce sprint policy: **no direct code edits — only prompt-based modifications** in deployment scripts and workflow files.

### Deliverables
- Deployed AWS Lambda function(s) with versioned artifacts.
- API Gateway REST API endpoint URL(s) for `dev` and `prod`.
- GitHub Actions backend deployment pipeline with logs for a successful run.
- Runbook for deployment, verification, and rollback.

### Risks & Mitigations
- Risk: Lambda timeout or memory limits break API responsiveness.
  - Mitigation: Set baseline memory/timeout from load tests and monitor CloudWatch metrics.
- Risk: API Gateway mapping/integration errors.
  - Mitigation: Add automated post-deploy smoke tests for all critical routes.
- Risk: Secret leakage in pipeline.
  - Mitigation: Use GitHub Secrets + least-privilege AWS IAM/OIDC and never hardcode credentials.

## 3. LLM Integration and Deployment

### Objective
Use LLM-assisted workflows to accelerate deployment automation and integration testing while enforcing verification controls to prevent hallucinated or unsafe outputs.

### Key Tasks
- Use LLM prompts to generate deployment assets:
  - GitHub Actions workflow templates for frontend (Amplify) and backend (Lambda + API Gateway),
  - environment variable checklists,
  - release and rollback runbooks.
- Use LLM prompts to generate integration test suites covering:
  - frontend-to-API happy paths,
  - authentication/authorization failures,
  - API error handling and timeout scenarios.
- Implement a verification pipeline for LLM outputs:
  - Agent A generates scripts/tests,
  - Agent B reviews for AWS service correctness (Lambda, API Gateway, Amplify),
  - Agent C validates security/compliance checks and test completeness.
- Add automated guards in GitHub Actions for every LLM-generated artifact:
  - linting and schema validation,
  - dry-run/deployment plan checks,
  - required reviewer approval before merge.
- Define acceptance criteria for “LLM-ready to merge”:
  - passes all CI checks,
  - maps to existing architecture,
  - includes deterministic test evidence.
- Enforce sprint policy: **no direct code edits — only prompt-based modifications** with all prompts and outputs tracked in pull requests.

### Deliverables
- Prompt library for deployment scripts, workflows, and integration tests.
- Multi-agent verification checklist and review template.
- CI evidence that LLM-generated workflows/tests pass and gate deployment.
- Audit trail in PRs showing prompt, output, verification, and approval.

### Risks & Mitigations
- Risk: LLM hallucinations produce invalid AWS configuration.
  - Mitigation: Multi-agent verification + mandatory dry-run checks before deploy.
- Risk: Incomplete integration test coverage from generated tests.
  - Mitigation: Require coverage matrix mapped to critical user journeys and API contracts.
- Risk: Over-reliance on LLM suggestions without engineering review.
  - Mitigation: Make human approval and branch protection checks mandatory for merge.

### Sprint Timeline (4 Weeks)
- Week 1: Set up AWS environments, Amplify app connection, Lambda packaging baseline, API Gateway route design, branch protection configuration.
- Week 2: Implement CI workflows in GitHub Actions for frontend and backend; deploy to `dev`; add smoke tests and initial integration tests.
- Week 3: Expand integration test coverage, stabilize CORS/env configs, apply multi-agent LLM verification flow, validate rollback process.
- Week 4: Production readiness review, deploy to `prod`, run full regression + integration suite, finalize runbooks and sprint demo evidence.