# CS485 Calculator on AWS

This repository now supports an AWS deployment with:

- `frontend/` hosted on AWS Amplify Hosting
- `backend/` exposed through Amazon API Gateway
- calculator execution running in AWS Lambda
- infrastructure defined in `infra/` with AWS CDK (TypeScript)

## Architecture

- Amplify pulls this GitHub repository and builds the Vite app from `frontend/`
- Amplify injects `VITE_CALCULATE_API_URL` at build time so the frontend calls API Gateway
- API Gateway exposes `POST /calculate`
- Lambda runs `backend/lambda.js`, which reuses the calculator logic from `backend/calculate.js`

## Local development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## AWS deployment

Prerequisites:

- AWS CLI configured
- CDK bootstrap permissions in the target account
- GitHub token with `repo` scope for Amplify Hosting

Install the CDK dependencies:

```bash
cd infra
npm install
```

Bootstrap the environment once per account and region:

```bash
cd infra
npm run bootstrap
```

Deploy the stack. This example uses the current GitHub auth token and points Amplify at the current branch:

```bash
cd infra
CURRENT_BRANCH="$(git -C .. branch --show-current)"
npm run deploy -- \
  --parameters AmplifyGitHubToken="$(gh auth token)" \
  --parameters AmplifyBranchName="$CURRENT_BRANCH"
```

Useful optional parameters:

- `--parameters AmplifyRepositoryUrl=https://github.com/acabrera04/cs485-calculator-deployed.git`
- `--parameters AmplifyAppName=cs485-calculator`
- `--parameters ApiAllowedOrigin=https://your-frontend-domain`

After deployment, CDK outputs the API endpoint, the Amplify console link, and the public Amplify branch URL.
