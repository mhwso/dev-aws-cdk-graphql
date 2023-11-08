#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DevAwsCdkGraphqlStack } from '../lib/dev-aws-cdk-graphql-stack';

const frontendPath = './frontend/my-app/www';
const domainName = 'trenkwalder-learning-mh.com';
const hostedZoneId = 'Z1JY41Y266322D';
const certArnUsEast1 = 'arn:aws:acm:us-east-1:509130371655:certificate/ce789b81-c8ee-4da1-b80d-dd8cbb7133aa';

const app = new cdk.App();

new DevAwsCdkGraphqlStack(app, 'DevAwsCdkGraphqlStack', {
	stageName: 'dev',
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
	domainName,
	hostedZoneId,
	certArnUsEast1,
	frontendPath,
});
