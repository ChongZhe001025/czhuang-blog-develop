# TickBoard

TickBoard 是一個透過 Docker 與 GitOps 交付的全端任務看板，結合 React 前端、Go／Gin API、MongoDB 資料儲存、Swagger 文件，以及可選用的 HTTPS 反向代理。

## 工程挑戰

當小型應用程式的交付路徑、執行邊界與營運行為都和程式碼一起被記錄時，它就能成為有價值的平台工程練習。TickBoard 提供具體的全端工作負載，用來實作容器化、API 設計、基礎設施建立與 GitOps 交付。

## 架構與設計

- 使用 React 前端與 Go／Gin API，作為可獨立部署的服務。
- 以 MongoDB 儲存應用程式資料，並提供 Swagger API 文件以利檢查與整合。
- 使用 Docker Compose 支援本機開發，並記錄透過 Terraform、Kubernetes 與 Argo CD 交付至叢集的流程。
- 在邊界使用 Nginx 提供 HTTPS，並明確路由前端、API 與資料庫管理路徑。

應用程式交付流程如下：

1. React 前端
2. Gin API
3. MongoDB
4. 容器化服務
5. Kubernetes 與 GitOps 交付

## 實作內容

- 在 React 與 Gin 服務中建置任務、使用者、註冊與驗證流程。
- 加入 JWT 驗證、Swagger 文件、健康檢查與 Docker 本機開發環境。
- 記錄 Terraform 基礎設施、Kubernetes Manifest、Kustomize Overlay 與 Argo CD 應用程式同步。
- 說明營運邊界，並標示僅供開發環境使用的儲存與密鑰處理決策。

## 驗證與影響

- Repository 記錄本機啟動、API 健康檢查、Swagger 與正式環境反向代理檢查方式。
- 專案定位為可展示的應用程式與部署練習，未宣稱正式環境可用性或服務等級成果。

## 限制與後續工作

- 文件中的 MongoDB 部署在開發環境使用 emptyDir，正式環境應改用持久化儲存。
- 密鑰、映像發布、Ingress 與叢集驗收仍需要依環境完成設定與驗證。
- Repository 是小型專案，因此作品集價值主要來自端到端交付流程，而不是應用程式本身的複雜度。

## 工程重點

這個專案展示如何在一個小型系統中整合應用程式程式碼、容器封裝、基礎設施即程式碼、Kubernetes 交付與營運文件。
