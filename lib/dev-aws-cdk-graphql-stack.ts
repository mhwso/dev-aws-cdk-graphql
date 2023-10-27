import * as cdk from 'aws-cdk-lib';
import {aws_appsync, aws_cognito, CfnOutput, Duration, Expiration, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from "constructs";
import {AccountRecovery, VerificationEmailStyle} from "aws-cdk-lib/aws-cognito";
import {AuthorizationType, Definition, FieldLogLevel} from "aws-cdk-lib/aws-appsync";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";
import {Bucket, ObjectOwnership} from "aws-cdk-lib/aws-s3";
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import {ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";
import {
    AllowedMethods,
    Distribution,
    OriginAccessIdentity,
    SecurityPolicyProtocol,
    ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";

export interface ExtendedProperties extends cdk.StageProps {
    readonly domainName: string
    readonly hostedZoneId: string
    readonly certArnUsEast1: string
}

export class DevAwsCdkGraphqlStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ExtendedProperties) {
        super(scope, id, props);

        const prefix: string = `${props.env?.account}-${props.env?.region}-${props.stageName}`;


        /**************************************************************************************************
         *
         * COGNITO
         *
         **************************************************************************************************/

        const userPool = new aws_cognito.UserPool(this, 'cdk-user-pool', {
            userPoolName: `${prefix}-cdk-user-pool`,
            selfSignUpEnabled: true,
            accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
            userVerification: {
                emailStyle: VerificationEmailStyle.CODE
            },
            autoVerify: {
                email: true
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true
                }
            }
        });

        const userPoolClient = new aws_cognito.UserPoolClient(this, 'UserPoolClient', {
            userPool
        })

        /**************************************************************************************************
         *
         * APPSYNC
         *
         **************************************************************************************************/

        const api = new aws_appsync.GraphqlApi(this, 'cdk-app', {
            name: `${prefix}-cdk-api`,
            logConfig: {
                fieldLogLevel: FieldLogLevel.ALL
            },
            definition: Definition.fromFile('./graphql/schema.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: Expiration.after(Duration.days(365))
                    }
                },
                additionalAuthorizationModes: [{
                    authorizationType: AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool
                    }
                }]
            },
        })

        /**************************************************************************************************
         *
         * LAMBDA
         *
         **************************************************************************************************/

        const productsLambda = new Function(this, 'AppSyncProductHandler', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'main.handler',
            code: Code.fromAsset('lambda-fns'),
            memorySize: 1024
        })

        const lambdaDs = api.addLambdaDataSource('lambdaDatasource', productsLambda)

        lambdaDs.createResolver('GetProductByIdResolver', {
            typeName: "Query",
            fieldName: "getProductById"
        })

        lambdaDs.createResolver('ListProductsResolver', {
            typeName: "Query",
            fieldName: "listProducts"
        })

        lambdaDs.createResolver('ProductsByCategoryResolver', {
            typeName: "Query",
            fieldName: "productsByCategory"
        })

        lambdaDs.createResolver('CreateProductResolver', {
            typeName: "Mutation",
            fieldName: "createProduct"
        })

        lambdaDs.createResolver('DeleteProductResolver', {
            typeName: "Mutation",
            fieldName: "deleteProduct"
        })

        lambdaDs.createResolver('UpdateProductResolver', {
            typeName: "Mutation",
            fieldName: "updateProduct"
        })

        /**************************************************************************************************
         *
         * DDB
         *
         **************************************************************************************************/

        const productsTable = new Table(this, 'ProductsTable', {
            tableName: `${prefix}-products`,
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING,
            },
        })

        // Add a global secondary index to enable another data access pattern
        productsTable.addGlobalSecondaryIndex({
            indexName: "productsByCategory",
            partitionKey: {
                name: "category",
                type: AttributeType.STRING,
            }
        })

        // Enable the Lambda function to access the DynamoDB table (using IAM)
        productsTable.grantFullAccess(productsLambda)

        // Create an environment variable that we will use in the function code
        productsLambda.addEnvironment('PRODUCTS_TABLE', productsTable.tableName)

        /**************************************************************************************************
         *
         * S3
         *
         **************************************************************************************************/

        const frontendBucket = new Bucket(this, 'FrontendBucket', {
            bucketName: `${prefix}-frontend-bucket`,
            objectOwnership: ObjectOwnership.OBJECT_WRITER,
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            blockPublicAccess: {
                blockPublicPolicy: false,
                blockPublicAcls: false,
                restrictPublicBuckets: false,
                ignorePublicAcls: false
            },
            publicReadAccess: true
        })

        const frontendBucketDeployment = new BucketDeployment(this, 'FrontendBucketDeployment', {
            destinationBucket: frontendBucket,
            sources: [Source.asset('./frontend/dist/dev-aws-cdk-graphql-frontend')]
        })

        /**************************************************************************************************
         *
         * ROUTE53 & CERTS & DISTRIBUTIONS
         *
         **************************************************************************************************/

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            zoneName: props.domainName,
            hostedZoneId: props.hostedZoneId
        });

        const usEast1Cert = Certificate.fromCertificateArn(
            this,
            'CertificateImportedFromUsEast1',
            props.certArnUsEast1
        );

        const cloudfrontOAI = new OriginAccessIdentity(this, 'CloudfrontOAI', {
            comment: `OAI for ${id}`
        });

        const frontendDistribution = new Distribution(this, 'FrontendDistribution', {
            certificate: usEast1Cert,
            defaultRootObject: 'index.html',
            domainNames: [props.domainName],
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 403,
                    responsePagePath: '/error.html',
                    ttl: Duration.minutes(1),
                }
            ],
            defaultBehavior: {
                origin: new S3Origin(frontendBucket, {originAccessIdentity: cloudfrontOAI}),
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            }
        });

        // cant be created when already existing
        // had to delete old version in my case
        new ARecord(this, 'SiteAliasRecord', {
            recordName: props.domainName,
            target: RecordTarget.fromAlias(new CloudFrontTarget(frontendDistribution)),
            zone: hostedZone
        });

        /**************************************************************************************************
         *
         * Outputs
         *
         **************************************************************************************************/

        new CfnOutput(this, `${prefix}-frontend-bucket`, {
            value: frontendBucket.bucketWebsiteUrl
        })

        new CfnOutput(this, `${prefix}-graphql-url`, {
            value: api.graphqlUrl
        })

        new CfnOutput(this, `${prefix}-graphql-api-key`, {
            value: api.apiKey || ''
        })

        new CfnOutput(this, `${prefix}-region`, {
            value: props.env?.region || ''
        })

        new CfnOutput(this, `${prefix}-user-pool-id`, {
            value: userPool.userPoolId
        })

        new CfnOutput(this, `${prefix}-user-pool-client-id`, {
            value: userPoolClient.userPoolClientId
        })
    }
}
