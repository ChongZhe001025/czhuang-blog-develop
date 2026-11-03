# BigQuery Infrastructure as Code & CDC Architecture

系統擴展至多個區域後，分析資料集、IAM、CDC 與 Terraform state 都需要明確的責任歸屬。若邊界不清，可能造成部署不一致、跨區域責任缺口，或資料同步風險。

## Architecture and design

- 區分全域與區域的資源責任，並明確指定 BigQuery 資料所在位置。
- 將資料集分為 Raw／Landing、Shared、Curated 與 Mart 層。
- 透過 Datastream 與私有連線元件連接 AlloyDB 和 BigQuery。
- 在來源端前置條件就緒前，讓 Datastream 保持選用且預設停用。

### Workflow

1. AlloyDB
2. Private Service Connect
3. Datastream
4. 區域 BigQuery 資料集
5. 整理後的資料層

## Implementation

- 建立可重用的 Terraform 模組，用於 BigQuery 資料集、IAM 成員與授權檢視表。
- 依相符的資料庫基礎設施範圍組合區域 BigQuery 資源。
- 設計私有 CDC 連線，包含 PSC endpoint、forwarding rule、network attachment 與 Datastream connection profile。
- 記錄 remote state 合約，並修正不同範圍間的 state key 與輸出值依賴。
- 在測試環境反覆執行 Terraform plan，調整資源組合方式與設定來源。

## Validation and impact

- BigQuery 模組與依範圍組合 Terraform 設定都有實作紀錄。
- 已檢查一個區域範圍的範例 plan；修正 remote state 依賴後，也重新檢查了其他範圍。
- Datastream 資料完整性問題促成後續驗證方式的設計。

## Limitations and next steps

- 目前沒有證據顯示所有範圍都已完成 Apply，或 Datastream 已廣泛啟用並通過正式環境資料驗收。
- 資料庫重設後的完整復原、跨區域查詢成本、歷史資料回填與資料治理仍待驗證。

## Engineering focus

涵蓋多區域資料架構、Terraform 組合、私有連線，以及資料管線可靠性規劃。
