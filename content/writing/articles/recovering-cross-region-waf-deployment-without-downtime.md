# Recovering a Cross-Region WAF Deployment Without Downtime

A CloudFront WAF change can fail even when the new Web ACL has already been created. The difficult case is a provider stack that tries to remove a Cross-Region Export while a consumer stack still imports it. CloudFormation then reports "Exports cannot be updated", and the provider stack can become stuck in UPDATE_ROLLBACK_FAILED.

This incident involved changing three production WAF rules from Block to Count. The new WAF and logging configuration were created, but the CloudFront distributions remained on the old WAF throughout recovery. The production services stayed available.

## The failure mode

The first deployment was:

~~~
npx cdk deploy Production-WebACL \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

CloudFormation returned:

~~~
Production-WebACL: UPDATE_FAILED
Custom::CrossRegionExportWriter
Error: Exports cannot be updated
~~~

The provider stack entered UPDATE_ROLLBACK_FAILED. The WAF stack was trying to remove the old legacyWebAcl export, while Production-CloudFront still depended on it. The important operational fact was that the new WAF existed, but CloudFront had not yet switched to it.

Before changing anything else, verify the account, both stacks, the WAF, and the distributions:

~~~
aws sts get-caller-identity \
  --profile prod \
  --output json

aws cloudformation describe-stacks \
  --profile prod \
  --region us-east-1 \
  --stack-name Production-WebACL \
  --query 'Stacks[0].{Status:StackStatus,Reason:StackStatusReason}' \
  --output json

aws cloudformation describe-stacks \
  --profile prod \
  --region ap-northeast-1 \
  --stack-name Production-CloudFront \
  --query 'Stacks[0].{Status:StackStatus,Reason:StackStatusReason}' \
  --output json
~~~

Also confirm which Web ACL each distribution uses:

~~~
for id in <distribution-id-1> <distribution-id-2> <distribution-id-3>; do
  aws cloudfront get-distribution \
    --profile prod \
    --id "$id" \
    --query 'Distribution.{Id:Id,Status:Status,WebACL:DistributionConfig.WebACLId}' \
    --output json
done
~~~

## Preserve the old export during the transition

The safe migration needs two separate changes:

1. Create and publish the new WAF export.
2. Remove the consumer's dependency on the old export.

To keep the old export alive during the first phase, temporarily add an output to src/CloudFrontStack.ts:

~~~typescript
if (!isTest) {
  new cdk.CfnOutput(this, 'LegacyWebAclArnForExportTransition', {
    value: props.legacyWebAclArn,
  });
}
~~~

This output does not change CloudFront traffic. It only keeps the old export reader present while the new WAF is published and the distributions are switched.

Before deploying, confirm the production configuration and inspect the diff:

~~~
sed -n '1,8p' src/info.ts

aws sts get-caller-identity \
  --profile prod \
  --query '{Account:Account,Arn:Arn}' \
  --output json

npx cdk diff Production-WebACL Production-CloudFront \
  --profile prod
~~~

## Recover and deploy in dependency order

### 1. Recover the failed provider stack

Skip only the explicitly failed Export Writer resource so that rollback can complete:

~~~
aws cloudformation continue-update-rollback \
  --profile prod \
  --region us-east-1 \
  --stack-name Production-WebACL \
  --resources-to-skip \
  ExportsWriterapnortheast12334E1B81D43DF3F

aws cloudformation wait stack-rollback-complete \
  --profile prod \
  --region us-east-1 \
  --stack-name Production-WebACL
~~~

The expected state is UPDATE_ROLLBACK_COMPLETE.

### 2. Deploy the new WAF export

~~~
npx cdk deploy Production-WebACL \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

At this point the new Web ACL and logging configuration should be available while the old export remains intact.

### 3. Switch CloudFront to the new WAF

~~~
npx cdk deploy Production-CloudFront \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

Verify that all distributions are Deployed, remain enabled, and reference the new Web ACL before continuing.

### 4. Remove the temporary reader

After the CloudFront switch is confirmed, remove LegacyWebAclArnForExportTransition from src/CloudFrontStack.ts and inspect the diff:

~~~
npx cdk diff Production-CloudFront \
  --profile prod
~~~

The diff should remove only the temporary reader; it should not change the CloudFront Web ACL association.

### 5. Remove the old export last

Deploy the consumer stack first, so it no longer imports the old export:

~~~
npx cdk deploy Production-CloudFront \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

Then deploy the provider stack:

~~~
npx cdk deploy Production-WebACL \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

The old export can now be removed because no consumer still references it.

## Verification checklist

Check both stacks:

~~~
aws cloudformation describe-stacks \
  --profile prod \
  --region us-east-1 \
  --stack-name Production-WebACL \
  --query 'Stacks[0].StackStatus' \
  --output text

aws cloudformation describe-stacks \
  --profile prod \
  --region ap-northeast-1 \
  --stack-name Production-CloudFront \
  --query 'Stacks[0].StackStatus' \
  --output text
~~~

Both should report UPDATE_COMPLETE. Then confirm that CDK is clean:

~~~
npx cdk diff Production-WebACL Production-CloudFront \
  --profile prod
~~~

Finally, check the production endpoints and confirm that the origin, DNS, and hosts were not changed as part of the WAF migration.

## Result

The six PHP rules in the shared production Web ACL were running in Count mode:

- PHPHighRiskMethodsVariables_HEADER
- PHPHighRiskMethodsVariables_QUERYSTRING
- PHPHighRiskMethodsVariables_BODY
- PHPHighRiskMethodsVariables_URIPATH
- PHP2Shell_BODY
- PHP2Shell_BODY_Extended

The final count was 55 rules: 6 AWS PHP managed rules and 49 CyberSecurityCloud OWASP rules. Immediately after deployment, both PHP CountedRequests and WAF SampledRequests were zero in the observed interval. Because CloudWatch metrics can lag shortly after a WAF change, observe the deployment for 24–48 hours before drawing conclusions from the counts.

The main lesson is to treat a Cross-Region Export as a dependency contract. Move the consumer first, and remove the provider's old export only after the consumer no longer imports it.
