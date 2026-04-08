import * as path from 'path'
import * as cdk from 'aws-cdk-lib'
import * as amplify from 'aws-cdk-lib/aws-amplify'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'

export class CalculatorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const repositoryUrl = new cdk.CfnParameter(this, 'AmplifyRepositoryUrl', {
      type: 'String',
      default: 'https://github.com/acabrera04/cs485-calculator-deployed.git',
      description: 'Git repository Amplify should build from.',
    })

    const branchName = new cdk.CfnParameter(this, 'AmplifyBranchName', {
      type: 'String',
      default: process.env.AMPLIFY_BRANCH_NAME ?? 'main',
      description: 'Git branch Amplify should track.',
    })

    const gitHubToken = new cdk.CfnParameter(this, 'AmplifyGitHubToken', {
      type: 'String',
      noEcho: true,
      description: 'GitHub personal access token with repo scope for Amplify Hosting.',
    })

    const amplifyAppName = new cdk.CfnParameter(this, 'AmplifyAppName', {
      type: 'String',
      default: 'cs485-calculator',
      description: 'Display name for the Amplify app.',
    })

    const apiAllowedOrigin = new cdk.CfnParameter(this, 'ApiAllowedOrigin', {
      type: 'String',
      default: '*',
      description: 'Browser origin allowed to call the API Gateway endpoint.',
    })

    const calculateFunction = new lambda.Function(this, 'CalculateFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend'), {
        exclude: ['index.js', 'node_modules', 'package-lock.json', 'package.json'],
      }),
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      description: 'Evaluates calculator expressions for the frontend.',
    })

    const api = new apigateway.RestApi(this, 'CalculatorApi', {
      restApiName: 'calculator-api',
      description: 'REST API for calculator requests.',
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [apiAllowedOrigin.valueAsString],
        allowMethods: ['OPTIONS', 'POST'],
        allowHeaders: ['Content-Type'],
      },
    })

    api.root
      .addResource('calculate')
      .addMethod('POST', new apigateway.LambdaIntegration(calculateFunction))

    const amplifyBuildSpec = [
      'version: 1',
      'frontend:',
      '  phases:',
      '    preBuild:',
      '      commands:',
      '        - cd frontend && npm ci',
      '    build:',
      '      commands:',
      '        - cd frontend && npm run build',
      '  artifacts:',
      '    baseDirectory: frontend/dist',
      '    files:',
      "      - '**/*'",
      '  cache:',
      '    paths:',
      '      - frontend/node_modules/**/*',
    ].join('\n')

    const frontendApp = new amplify.CfnApp(this, 'FrontendApp', {
      name: amplifyAppName.valueAsString,
      description: 'Calculator frontend hosted on Amplify.',
      platform: 'WEB',
      repository: repositoryUrl.valueAsString,
      accessToken: gitHubToken.valueAsString,
      buildSpec: amplifyBuildSpec,
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: '200',
        },
      ],
    })

    const frontendBranch = new amplify.CfnBranch(this, 'FrontendBranch', {
      appId: frontendApp.attrAppId,
      branchName: branchName.valueAsString,
      framework: 'React',
      stage: 'PRODUCTION',
      enableAutoBuild: true,
      environmentVariables: [
        {
          name: 'VITE_CALCULATE_API_URL',
          value: api.urlForPath('/calculate'),
        },
      ],
    })
    frontendBranch.addDependency(frontendApp)

    new cdk.CfnOutput(this, 'CalculateApiUrl', {
      value: api.urlForPath('/calculate'),
      description: 'Public calculate endpoint used by the frontend.',
    })

    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: frontendApp.attrAppId,
      description: 'Amplify app identifier.',
    })

    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://${this.region}.console.aws.amazon.com/amplify/home?region=${this.region}#/${frontendApp.attrAppId}`,
      description: 'Amplify console URL for the deployed app.',
    })

    new cdk.CfnOutput(this, 'AmplifyBranchUrl', {
      value: cdk.Fn.join('', ['https://', branchName.valueAsString, '.', frontendApp.attrDefaultDomain]),
      description: 'Hosted frontend URL for the selected branch.',
    })
  }
}
