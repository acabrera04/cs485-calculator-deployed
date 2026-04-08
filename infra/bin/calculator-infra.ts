#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CalculatorStack } from '../lib/calculator-stack'

const app = new cdk.App()

new CalculatorStack(app, 'CalculatorStack', {
  description: 'Calculator app on Amplify Hosting with a Lambda-backed API Gateway backend.',
})
