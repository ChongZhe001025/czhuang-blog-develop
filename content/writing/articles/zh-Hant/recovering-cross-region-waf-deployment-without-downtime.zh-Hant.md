# 修復跨 Region WAF 部署並維持服務不中斷

CloudFront WAF 變更有可能在新的 Web ACL 已建立後仍然失敗。最棘手的情況是 Provider Stack 嘗試移除 Cross-Region Export，但 Consumer Stack 仍在匯入它。此時 CloudFormation 會回報「Exports cannot be updated」，Provider Stack 也可能卡在 UPDATE_ROLLBACK_FAILED。

本次事件是將正式站 WAF 的三條規則由 Block 改為 Count。新的 WAF 與 Logging 已建立，但 CloudFront 在修復完成前仍使用舊 WAF；整個處理期間正式服務維持可用。

## 失敗情境

第一次部署使用：

~~~
npx cdk deploy Production-WebACL \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

CloudFormation 回報：

~~~
Production-WebACL: UPDATE_FAILED
Custom::CrossRegionExportWriter
Error: Exports cannot be updated
~~~

Provider Stack 進入 UPDATE_ROLLBACK_FAILED。WAF Stack 嘗試移除舊的 legacyWebAcl Export，但 Production-CloudFront 仍依賴它。此時最重要的判斷是：新的 WAF 已存在，但 CloudFront 尚未切換。

繼續處理前，先確認帳號、兩個 Stack、WAF 與 CloudFront 狀態：

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

確認每個 Distribution 使用的 Web ACL：

~~~
for id in <distribution-id-1> <distribution-id-2> <distribution-id-3>; do
  aws cloudfront get-distribution \
    --profile prod \
    --id "$id" \
    --query 'Distribution.{Id:Id,Status:Status,WebACL:DistributionConfig.WebACLId}' \
    --output json
done
~~~

## 過渡期間保留舊 Export

安全的遷移需要拆成兩個變更：

1. 建立並發布新的 WAF Export。
2. 移除 Consumer 對舊 Export 的相依性。

第一階段先在 src/CloudFrontStack.ts 暫時加入輸出：

~~~typescript
if (!isTest) {
  new cdk.CfnOutput(this, 'LegacyWebAclArnForExportTransition', {
    value: props.legacyWebAclArn,
  });
}
~~~

這個輸出不會改變 CloudFront 流量，只是讓舊 Export Reader 在建立新 WAF 與切換 Distribution 期間持續存在。

部署前確認正式設定並檢查差異：

~~~
sed -n '1,8p' src/info.ts

aws sts get-caller-identity \
  --profile prod \
  --query '{Account:Account,Arn:Arn}' \
  --output json

npx cdk diff Production-WebACL Production-CloudFront \
  --profile prod
~~~

## 依相依性順序恢復與部署

### 1. 恢復失敗的 Provider Stack

只跳過明確失敗的 Export Writer 資源，讓 rollback 完成：

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

預期狀態為 UPDATE_ROLLBACK_COMPLETE。

### 2. 部署新的 WAF Export

~~~
npx cdk deploy Production-WebACL \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

此時新的 Web ACL 與 Logging 應已可用，同時舊 Export 仍然存在。

### 3. 將 CloudFront 切換至新 WAF

~~~
npx cdk deploy Production-CloudFront \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

繼續前確認三個 Distribution 都是 Deployed、維持啟用，且已參照新的 Web ACL。

### 4. 移除暫時性 Reader

確認 CloudFront 切換成功後，從 src/CloudFrontStack.ts 移除 LegacyWebAclArnForExportTransition，再檢查差異：

~~~
npx cdk diff Production-CloudFront \
  --profile prod
~~~

差異應只移除暫時性 Reader，不應改變 CloudFront 的 Web ACL 綁定。

### 5. 最後移除舊 Export

先部署 Consumer Stack，使它不再匯入舊 Export：

~~~
npx cdk deploy Production-CloudFront \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

再部署 Provider Stack：

~~~
npx cdk deploy Production-WebACL \
  --profile prod \
  --exclusively \
  --require-approval never
~~~

此時已沒有 Consumer 參照舊 Export，因此可以正常移除。

## 驗證清單

確認兩個 Stack：

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

兩者都應回報 UPDATE_COMPLETE。接著確認 CDK 沒有差異：

~~~
npx cdk diff Production-WebACL Production-CloudFront \
  --profile prod
~~~

最後檢查正式服務，並確認這次 WAF 遷移沒有修改 Origin、DNS 或主機。

## 最終結果

正式站共用 WAF 的六條 PHP 規則都以 Count 模式執行：

- PHPHighRiskMethodsVariables_HEADER
- PHPHighRiskMethodsVariables_QUERYSTRING
- PHPHighRiskMethodsVariables_BODY
- PHPHighRiskMethodsVariables_URIPATH
- PHP2Shell_BODY
- PHP2Shell_BODY_Extended

Count 規則總數為 55 條，其中 AWS PHP Managed Rule 有 6 條，CyberSecurityCloud OWASP 有 49 條。部署後觀察區間內，PHP CountedRequests 與 WAF SampledRequests 都是 0。由於 WAF 變更後 CloudWatch 指標可能延遲數分鐘，應觀察 24～48 小時後再判斷實際命中情況。

這次修復的重點，是把 Cross-Region Export 視為一份相依性契約：先讓 Consumer 停止使用舊 Export，再由 Provider 移除它。
