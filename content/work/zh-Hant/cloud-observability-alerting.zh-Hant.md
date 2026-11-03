# Cloud Observability & Alerting Infrastructure

可靠維運仰賴故障偵測、告警傳遞與有用日誌的保留。這些流程橫跨多個系統，因此必須明確設計並驗證可用性、密鑰處理與失敗行為。

## Architecture and design

- 降低維護期間監控元件中斷的風險。
- 從 AWS Secrets Manager 讀取通知密鑰，避免將 token 寫入原始碼。
- 針對傳送日誌至 S3 的流程，明確定義來源路徑、排程、失敗紀錄與關機時的緩衝資料寫入。

## Implementation

- 調整 Alertmanager 副本數與 PodDisruptionBudget，並解析 Kubernetes YAML 確認結構有效。
- 透過 AWS CDK 整合特定 EC2／資料庫停止告警與 Lambda 通知設定。
- 評估聊天工具通知管道，並建議從受管理的密鑰儲存服務讀取憑證。
- 檢視 EC2／VM 日誌傳送至 S3 的設計，包括日誌路徑、S3 key 分區、排程與錯誤紀錄。
- 找出固定服務路徑、缺少排程工作輸出、關機時未寫入緩衝資料，以及 cron 重疊等風險。
- 提出依環境設定日誌路徑、明確記錄執行結果，並以 systemd timer 作為後續方案。

## Validation and impact

- 部分 Alertmanager 設定變更有結構驗證紀錄。
- AWS 告警整合已通過編譯，但尚未確認通知端到端成功送達。
- S3 日誌傳送仍屬設計與風險檢視，沒有正式環境部署的證據。

## Limitations and next steps

- 告警送達率、監控涵蓋範圍、日誌傳輸失敗處理、S3 生命週期政策，以及元件故障時的監控可用性都需要進一步驗證。

## Engineering focus

展現可觀測性設計、營運風險分析、告警設定與可靠性工程實務。
