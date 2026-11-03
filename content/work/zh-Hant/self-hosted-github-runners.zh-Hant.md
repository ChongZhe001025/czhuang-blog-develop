# Self-Hosted GitHub Actions Runner Platform

多位工程師需要各自獨立的開發站台，但不希望每人都配置一套主機與資料服務。同時，自架 Runner 平台也需要更清楚的環境邊界、更容易診斷的排程問題、更快的映像建置，以及從映像追溯回 CI 執行紀錄的能力。

## Architecture and design

- 透過 Terraform 與 GitOps 管理 Kubernetes Runner 資源，並區隔開發與正式環境的 Runner 範圍。
- 將可獨立建置的映像拆成可排程的 Runner 工作，並在產出物附上 CI 執行中繼資料以利追溯。

### CI Runner 工作流程

1. GitHub Actions 工作流程
2. Kubernetes Runner Scale Set
3. 平行建置工作
4. 容器映像
5. OCI 執行中繼資料

## Shared development environment

共用一台 Docker 主機可降低每位工程師的基礎設施成本；再以主機名稱路由搭配各分支專屬的容器堆疊，讓開發站台彼此區隔。

- 共用一台開發主機及 HTTPS 入口與反向代理；依各工程師的主機名稱，將請求導向對應分支的容器堆疊。
- 每個分支堆疊使用各自的服務容器與發布連接埠，讓多個站台共用主機時不會發生連接埠衝突或跨站請求路由。
- 共用 PostgreSQL 服務，但依分支區隔資料庫。拓樸圖雖顯示共用 Redis，卻未記載每位工程師的 keyspace 或 ACL 邊界，因此不宣稱快取資料已完整隔離。
- 工程師僅透過應用程式與部署流程存取環境；具高權限的主機管理則走獨立的維運人員專用路徑，不開放工程師直接 SSH。

### Request path

1. 工程師專屬主機名稱
2. 共用 HTTPS 入口
3. 依主機名稱進行反向代理
4. 分支專屬容器與連接埠
5. 共用 PostgreSQL／Redis 服務

## Implementation

- 使用 Terraform 與 GitOps 管理 GitHub Actions Runner 資源。
- 分開設定開發與正式環境的 Runner namespace。
- 檢視 ARC controller、listener、Runner Scale Set、Runner group 與 workflow label，診斷工作無法排程的原因。
- 確認閒置 Runner 縮減至零的行為，並調查 label 與 Runner group 的配對設定。
- 將 Docker 元件建置拆成多個 GitHub Actions 工作，同時保留既有工作流程條件。
- 在 OCI 映像標籤加入 GitHub Run ID 與 Run Attempt，追溯映像建置紀錄。
- 透過依主機名稱設定的 Nginx 路由，將服務請求導向共用開發主機上各分支專屬的容器連接埠。
- 共用 PostgreSQL 服務，並為各分支建立獨立資料庫；現有拓樸無法證明 Redis 也具備同等的工程師間隔離。
- 直接管理主機的權限保留給基礎設施維運人員；工程師則使用應用程式與 CI 部署流程。
- 使用 YAML parser、Actionlint 與差異檢視檢查工作流程變更。

## Validation and impact

- 開發環境 Runner 的 Terraform plan 僅顯示預期新增 namespace，且沒有資源銷毀操作。
- 工作流程語法與靜態檢查都有成功驗證的紀錄。
- 部分正式環境 Runner 規劃因缺少本機 Kubernetes context 而受阻，因此不列為已完整驗證。

## Limitations and next steps

- 自動化 Beta 部署、映像更新器、Git 回寫與復原仍屬後續設計工作，不包含在已完成的 Runner 變更中。
- 正式環境 Runner 變更仍須依環境完成驗證。
- 共用主機拓樸透過主機路由、分支容器與資料庫提供站台層級的區隔，但並未為每位工程師配置獨立 VM 或網路邊界。
- 拓樸中多個站台共用執行環境與資料網路，也沒有記載每位工程師各自的 Redis ACL 或 keyspace 隔離；在取得更多證據前，不應宣稱快取資料已隔離。
- 現有紀錄將 Runner 平台與共用開發主機架構描述為互補的工作流程元件，沒有證據顯示 Runner 平台會直接佈建或部署每個站台。

## Engineering focus

展現 CI 平台維運及多位開發者的環境設計：共用基礎設施，同時明確劃分站台、資料與主機管理權限。
