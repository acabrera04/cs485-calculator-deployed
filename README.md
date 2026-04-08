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
- The Amplify GitHub App installed for the target AWS region
- A GitHub personal access token with `admin:repo_hook` for the Amplify GitHub App flow

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

Install the regional Amplify GitHub App before the first deployment. For `us-east-2`, the install URL is:

```text
https://github.com/apps/aws-amplify-us-east-2/installations/new
```

Deploy the stack with the GitHub App flow:

```bash
cd infra
export AMPLIFY_GITHUB_APP_ACCESS_TOKEN=your_github_pat
npm run deploy:github-app
```

Useful optional parameters:

- `--parameters AmplifyRepositoryUrl=https://github.com/acabrera04/cs485-calculator-deployed.git`
- `--parameters AmplifyAppName=cs485-calculator`
- `--parameters ApiAllowedOrigin=https://your-frontend-domain`

The deploy script derives the current Git branch automatically and passes the token to the CDK `accessToken` field, which AWS documents for new Amplify apps that use the GitHub App. It does not use `OauthToken`.

After deployment, CDK outputs the API endpoint, the Amplify console link, and the public Amplify branch URL.
