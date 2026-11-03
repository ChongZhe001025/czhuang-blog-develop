# Secure Vendor Development Environment Design

外部協作者需要存取程式碼儲存庫與服務，但若共用開發基礎設施的邊界不清楚，可能造成資料曝露、環境互相干擾，以及變更追蹤不足。

## Architecture and design

- 為每位外部開發者配置權限範圍獨立的執行環境與服務端點。
- 以可重用的 DNS、TLS 與健康檢查設定管理端點。
- 將儲存庫控管、雲端身分、網路政策與測試資料邊界納入分層存取模型。
- 將日誌、監控、敏感資訊遮罩與稽核視為規劃中的營運控管，不宣稱這些功能已完整建置。

## Implementation

- 盤點 GitHub 儲存庫、CI/CD、DNS、服務端點、IAM 與 GCP 基礎設施。
- 設計可重用的 Vendor Runtime Template 與外部開發者隔離環境模型。
- 規劃儲存庫團隊或外部協作者權限、分支保護、必要檢查與部署邊界。
- 設計 PostgreSQL、Redis 與 GCS 測試資料的限縮存取方式，以及日誌、監控、遮罩與稽核需求。
- 實作部分 Terraform IAM 設定並執行靜態驗證。
- 確認部分雲端存取變更仍停留在 Terraform 設定中，尚未套用至環境。

## Validation and impact

- GCP IAM 設定變更、Terraform 驗證與外部協作者存取調整都有實作紀錄。
- 現有證據支持的是架構設計與部分 IAM 實作，並非完整的外部協作者平台上線。

## Limitations and next steps

- 尚未確認獨立執行環境、完整 CI/CD、UAT 與安全驗收均已完成。
- 部分 Terraform 權限變更尚未套用。

## Engineering focus

展現開發者環境架構、最小權限規劃、外部協作治理與營運隔離設計。
