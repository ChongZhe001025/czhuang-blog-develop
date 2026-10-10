export const caseStudyTranslations = {
    "schema-compatibility-ci": {
        challenge: "多個應用程式儲存庫會使用共用 Go 模組中的資料庫遷移。即使建置或單元測試通過，也不一定能發現分支引用了較舊的模組版本、修改了已發布的遷移，或新增了不相容於既有應用程式版本的資料庫結構變更。",
        architecture: [
            "比對目前分支與 develop 基準分支所引用的共用模組版本。",
            "在程式碼合併前，檢查遷移歷程與新增的資料庫結構變更。",
            "透過 CI 回報驗證結果，讓儲存庫負責人在合併前檢視失敗項目。"
        ],
        diagram: ["應用程式儲存庫", "共用 Go 模組", "遷移完整性檢查", "資料庫結構相容性檢查", "CI 狀態"],
        implementation: [
            "新增跨儲存庫檢查，確認共用 Go 模組的版本一致性。",
            "利用 Git 歷程與遷移差異，偵測既有遷移檔案遭刪除或修改的情況。",
            "加入遷移命名、重複數字版本，以及已發布檔案不可變更等檢查。",
            "加入資料庫相容性檢查，例如新增可為 NULL 的欄位，以及新增具有預設值的必填欄位。",
            "為有效變更、無效遷移，以及 SQL 註解解析邊界案例加入 Python 單元測試。",
            "僅在相關儲存庫設定私有 Go 模組的 SSH URL 改寫，避免變更全域 Git 設定。"
        ],
        validation: [
            "檢查程式與單元測試都有成功執行的紀錄。",
            "當分支引用的共用模組版本早於 develop，且遷移有所缺漏時，檢查流程會拒絕該分支。這驗證了防護機制有效，也揭示版本比較必須先滿足版本對齊的前提。"
        ],
        limitations: [
            "尚未確認完整的 Branch Protection、Merge Queue、所有分支觸發條件，以及私有儲存庫權限涵蓋範圍。",
            "目前的比較方式假設工作分支所使用的共用模組版本不早於選定的基準版本。"
        ],
        portfolioValue: "展現跨儲存庫的預防性工程實作，並明確檢查依賴版本一致性與資料庫變更安全性。"
    },
    "aws-asg-scaling-policies": {
        challenge: "多項服務同時使用 CloudWatch 擴縮政策、容量排程，以及 Blue/Green Auto Scaling Group。主要挑戰是釐清這些控制如何互相影響：排程設定的最小與最大容量可能限制擴縮政策；固定容量的群組無法水平擴縮；而歷史 synth 紀錄也不一定符合目前的原始碼快照或 AWS 實際設定。",
        architecture: [
            "使用 CPU 階梯式擴縮增加容量，並以獨立的低使用率警示保守地一次移除一個執行個體。",
            "可選擇啟用 Network In／Out 政策；當每個執行個體的流量超過實測目標時向外擴縮。網路政策不負責縮減容量。",
            "依工作負載排程調整 ASG 容量，提前因應預期需求；將服務當地時間轉換為 UTC cron，並處理跨日造成的星期變化。",
            "所有動態調整都限制在 ASG 的最小與最大容量內，並將排程套用至預期承接流量的部署目標。",
            "將 Mixed Instances Policy、ELB 健康檢查、執行個體暖機與 Capacity Rebalance 納入容量生命週期設計。"
        ],
        diagram: ["CloudWatch 指標", "即時擴縮政策", "排程容量調整", "ASG 容量邊界與部署目標", "EC2 執行個體與負載平衡器健康狀態"],
        implementation: [
            "實作 CPU 階梯式向外擴縮，並以獨立且保守的低使用率警示向內縮減；同時設定執行個體暖機與冷卻控制。",
            "加入可選的每執行個體 Network In 與 Network Out 向外擴縮政策。網路擴縮預設停用，必須明確啟用；這些政策不會縮減容量。",
            "為正式環境 Web 工作負載建立每日及平日／週末容量排程，將服務當地時間轉成 UTC cron，並調整跨越 UTC 日期時的星期設定。",
            "加入部署時的開關，可單獨停用排程動作而保留 CPU 即時擴縮政策。",
            "設定 Mixed Instances Policy，依環境的分配設定混用 On-Demand 與 Spot 容量。",
            "啟用 ELB 健康檢查與 Capacity Rebalance，並在有設定時依服務調整健康檢查寬限期。",
            "讓 Blue/Green 目標各自獨立，使排程能跟隨目前啟用的部署目標；min=max 的固定容量群組不納入水平擴縮。"
        ],
        dataTables: [
            {
                title: "擴縮政策行為",
                headers: ["控制項", "觸發訊號", "容量調整", "保護條件"],
                rows: [
                    ["CPU 向外擴縮", "平均 CPU 依分級區間評估", "依政策級距增加容量", "已設定暖機與冷卻時間"],
                    ["CPU 向內縮減", "持續低使用率；缺失資料視為未違反條件", "逐步減少容量", "使用獨立且保守的警示"],
                    ["網路向外擴縮", "每執行個體網路流量；由服務選擇啟用", "超過設定目標時增加容量", "已設定暖機時間；網路政策不負責縮減容量"]
                ]
            },
            {
                title: "容量排程模式",
                headers: ["排程", "容量行為", "目的"],
                rows: [
                    ["每日基準", "調整最小與最大容量", "在低需求時段保留規劃好的服務基本容量"],
                    ["預期尖峰時段", "提前提高最小容量", "在週期性需求到來前預先啟動執行個體"],
                    ["平日／週末版本", "分別使用當地時間排程", "因應不同需求型態，且不公開精確時段"],
                    ["部署目標", "將排程容量界限套用至目前啟用的目標", "讓 Blue/Green 容量與流量路由保持一致"]
                ]
            }
        ],
        validation: [
            "容量排程變更有原始碼與提交紀錄，但並非每項歷史變更都有後續 synth、部署及依指標驗收的紀錄。",
            "Blue/Green 容量變更有 TypeScript 編譯與 CDK synth 紀錄。目前可讀取的原始碼與歷史結果不同，因此這些紀錄無法證明 AWS 實際 ASG 狀態。",
            "先前的網路政策檢視發現，設定目標可能過於接近受評估執行個體系列的突發流量能力。這表示政策應依實際流量重新調整，但不能據此推論目標值或執行個體系列已在部署中變更。",
            "目前沒有完整的 CDK 與 AWS Console 差異檢視、正式環境行為驗證，也沒有延遲、錯誤率、擴縮時間或成本改善的量測結果。"
        ],
        limitations: [
            "目前可讀取的 helper 使用 CPU 階梯式向外擴縮及 CPU 警示向內縮減；歷史檢視紀錄則提到 Target Tracking。應視為不同的原始碼快照，不可合併描述為單一實際設定。",
            "階梯級距的意義取決於關聯的警示設定。若要將級距解讀為絕對 CPU 門檻，應先確認 synth 產生的 CloudFormation 政策。",
            "共用網路政策預設停用。檢視時發現其目標可能過於接近某執行個體系列的突發流量上限；若要啟用，應依觀測到的流量與突發行為選定目標。",
            "ASG 政策不能超出最小與最大容量界限。固定容量群組無法向外擴縮，容量為零且未啟用的 Blue/Green 群組也不能透過擴縮政策預先暖機。",
            "目前可讀取的原始碼與歷史 Blue/Green synth 紀錄不同。描述實際行為前，應先透過 CDK synth 及 AWS Console 確認目標分支設定。",
            "排程是依預期需求預留容量，不能證明預測符合實際流量。仍須驗證排程與政策的互動、健康檢查、暖機時間、網路與儲存 I/O、請求量，以及負載平衡器的延遲與錯誤指標。",
            "Mixed Instances 的容量分配設定曾經變更。歷史數值只適用於各自的版本，不能當作目前正式環境設定。"
        ],
        portfolioValue: "展現對即時與排程擴縮、Blue/Green 限制、Spot 行為、原始碼與實際環境差異，以及依據證據調整政策的容量管理判斷。"
    },
    "self-hosted-github-runners": {
        challenge: "多位工程師需要各自獨立的開發站台，但不希望每人都配置一套主機與資料服務。同時，自架 Runner 平台也需要更清楚的環境邊界、更容易診斷的排程問題、更快的映像建置，以及從映像追溯回 CI 執行紀錄的能力。",
        architecture: [
            "透過 Terraform 與 GitOps 管理 Kubernetes Runner 資源，並區隔開發與正式環境的 Runner 範圍。",
            "將可獨立建置的映像拆成可排程的 Runner 工作，並在產出物附上 CI 執行中繼資料以利追溯。"
        ],
        diagramCaption: "CI Runner 工作流程",
        diagram: ["GitHub Actions 工作流程", "Kubernetes Runner Scale Set", "平行建置工作", "容器映像", "OCI 執行中繼資料"],
        sharedEnvironment: {
            summary: "共用一台 Docker 主機可降低每位工程師的基礎設施成本；再以主機名稱路由搭配各分支專屬的容器堆疊，讓開發站台彼此區隔。",
            controls: [
                "共用一台開發主機及 HTTPS 入口與反向代理；依各工程師的主機名稱，將請求導向對應分支的容器堆疊。",
                "每個分支堆疊使用各自的服務容器與發布連接埠，讓多個站台共用主機時不會發生連接埠衝突或跨站請求路由。",
                "共用 PostgreSQL 服務，但依分支區隔資料庫。拓樸圖雖顯示共用 Redis，卻未記載每位工程師的 keyspace 或 ACL 邊界，因此不宣稱快取資料已完整隔離。",
                "工程師僅透過應用程式與部署流程存取環境；具高權限的主機管理則走獨立的維運人員專用路徑，不開放工程師直接 SSH。"
            ],
            diagram: ["工程師專屬主機名稱", "共用 HTTPS 入口", "依主機名稱進行反向代理", "分支專屬容器與連接埠", "共用 PostgreSQL／Redis 服務"]
        },
        implementation: [
            "使用 Terraform 與 GitOps 管理 GitHub Actions Runner 資源。",
            "分開設定開發與正式環境的 Runner namespace。",
            "檢視 ARC controller、listener、Runner Scale Set、Runner group 與 workflow label，診斷工作無法排程的原因。",
            "確認閒置 Runner 縮減至零的行為，並調查 label 與 Runner group 的配對設定。",
            "將 Docker 元件建置拆成多個 GitHub Actions 工作，同時保留既有工作流程條件。",
            "在 OCI 映像標籤加入 GitHub Run ID 與 Run Attempt，追溯映像建置紀錄。",
            "透過依主機名稱設定的 Nginx 路由，將服務請求導向共用開發主機上各分支專屬的容器連接埠。",
            "共用 PostgreSQL 服務，並為各分支建立獨立資料庫；現有拓樸無法證明 Redis 也具備同等的工程師間隔離。",
            "直接管理主機的權限保留給基礎設施維運人員；工程師則使用應用程式與 CI 部署流程。",
            "使用 YAML parser、Actionlint 與差異檢視檢查工作流程變更。"
        ],
        validation: [
            "開發環境 Runner 的 Terraform plan 僅顯示預期新增 namespace，且沒有資源銷毀操作。",
            "工作流程語法與靜態檢查都有成功驗證的紀錄。",
            "部分正式環境 Runner 規劃因缺少本機 Kubernetes context 而受阻，因此不列為已完整驗證。"
        ],
        limitations: [
            "自動化 Beta 部署、映像更新器、Git 回寫與復原仍屬後續設計工作，不包含在已完成的 Runner 變更中。",
            "正式環境 Runner 變更仍須依環境完成驗證。",
            "共用主機拓樸透過主機路由、分支容器與資料庫提供站台層級的區隔，但並未為每位工程師配置獨立 VM 或網路邊界。",
            "拓樸中多個站台共用執行環境與資料網路，也沒有記載每位工程師各自的 Redis ACL 或 keyspace 隔離；在取得更多證據前，不應宣稱快取資料已隔離。",
            "現有紀錄將 Runner 平台與共用開發主機架構描述為互補的工作流程元件，沒有證據顯示 Runner 平台會直接佈建或部署每個站台。"
        ],
        portfolioValue: "展現 CI 平台維運及多位開發者的環境設計：共用基礎設施，同時明確劃分站台、資料與主機管理權限。"
    },
    "bigquery-cdc-architecture": {
        challenge: "系統擴展至多個區域後，分析資料集、IAM、CDC 與 Terraform state 都需要明確的責任歸屬。若邊界不清，可能造成部署不一致、跨區域責任缺口，或資料同步風險。",
        architecture: [
            "區分全域與區域的資源責任，並明確指定 BigQuery 資料所在位置。",
            "將資料集分為 Raw／Landing、Shared、Curated 與 Mart 層。",
            "透過 Datastream 與私有連線元件連接 AlloyDB 和 BigQuery。",
            "在來源端前置條件就緒前，讓 Datastream 保持選用且預設停用。"
        ],
        diagram: ["AlloyDB", "Private Service Connect", "Datastream", "區域 BigQuery 資料集", "整理後的資料層"],
        implementation: [
            "建立可重用的 Terraform 模組，用於 BigQuery 資料集、IAM 成員與授權檢視表。",
            "依相符的資料庫基礎設施範圍組合區域 BigQuery 資源。",
            "設計私有 CDC 連線，包含 PSC endpoint、forwarding rule、network attachment 與 Datastream connection profile。",
            "記錄 remote state 合約，並修正不同範圍間的 state key 與輸出值依賴。",
            "在測試環境反覆執行 Terraform plan，調整資源組合方式與設定來源。"
        ],
        validation: [
            "BigQuery 模組與依範圍組合 Terraform 設定都有實作紀錄。",
            "已檢查一個區域範圍的範例 plan；修正 remote state 依賴後，也重新檢查了其他範圍。",
            "Datastream 資料完整性問題促成後續驗證方式的設計。"
        ],
        limitations: [
            "目前沒有證據顯示所有範圍都已完成 Apply，或 Datastream 已廣泛啟用並通過正式環境資料驗收。",
            "資料庫重設後的完整復原、跨區域查詢成本、歷史資料回填與資料治理仍待驗證。"
        ],
        portfolioValue: "涵蓋多區域資料架構、Terraform 組合、私有連線，以及資料管線可靠性規劃。"
    },
    "aws-ec2-ami-automation": {
        challenge: "建立暫用 EC2 映像建置機並擷取 AMI，需要反覆查詢設定和手動傳遞參數。若沿用錯誤的來源設定，可能造成啟動配置偏差；而分開執行的腳本也容易遺失執行個體 ID，或混淆兩階段各自的 dry-run 控制。後續排查還遇到加密磁碟區的 KMS 存取、SSM 連線，以及如何清理舊映像又不刪除仍被引用資源等問題。",
        architecture: [
            "將建置用執行個體建立與 AMI 擷取視為兩個獨立階段，以新建執行個體的 ID 作為明確交接資訊。",
            "從服務目前啟用的 Auto Scaling Group 與 InService 執行個體取得啟動設定，包括基礎 AMI、執行個體規格、子網路、安全群組、金鑰組與執行個體設定檔。",
            "輸出可安全貼入 Shell 的參數，包含區域、執行個體 ID、服務、環境、日期、重新啟動、AMI dry-run 與等待選項；只有實際啟動建置機時才寫入本機交接檔。",
            "將映像清理與映像建立分開：先從 EC2、Launch Template 的 Default／Latest 版本及 Launch Configuration 收集引用，再依映像年齡篩選候選項目。"
        ],
        diagram: ["目前啟用的 Auto Scaling Group", "沿用設定建立 EC2 建置機", "交接映像建置參數", "擷取並標記 AMI", "依引用與年齡篩選舊映像"],
        implementation: [
            "加入服務白名單，並依共用命名規則推導候選 Auto Scaling Group；無法辨識唯一啟用群組時停止，避免從不確定的部署目標建機。",
            "從目前啟用的執行個體取得啟動參數，避免在指令中重複硬編碼各環境設定。若發現多個子網路，腳本會警告並選取第一個；這仍是需要操作人員留意的決策點。",
            "讓建置腳本輸出 AMI 腳本所需的完整參數；只有實際建立 EC2 時才更新本機 .ec2_env 交接檔，避免把產生的執行個體狀態提交至版本控制。",
            "將 EC2 啟動 dry-run 與 AMI 建立 dry-run 分開控制，並提供 no-reboot 與 wait 選項，讓兩階段能分別檢查。",
            "避免使用 Bash 4 關聯陣列，維持對 macOS 預設 Bash 3.2 的相容性。",
            "建立 AMI 清理流程，合併 EC2、Launch Template Default／Latest 版本與 Launch Configuration 的引用清單，再篩選未引用且建立超過一年的映像。Snapshot 另行檢查，因同一份 Snapshot 可能仍被其他 AMI 使用。",
            "在相鄰的 CDK 管理 Ubuntu 啟動流程中，加強 SSM 診斷：支援 snap 管理與套件安裝的 Agent，透過 IMDSv2 取得區域，並檢查執行個體角色、區域 SSM endpoint 與服務狀態。"
        ],
        operationalLessons: [
            "EC2 成功啟動不代表 AMI 一定能建立：若 EBS 磁碟使用加密，必須確認 KMS key 已啟用，且 key policy／grant 允許呼叫身分執行 kms:CreateGrant、kms:Decrypt、kms:DescribeKey、kms:GenerateDataKeyWithoutPlaintext 與 kms:ReEncrypt。",
            "SSM 連線是另一條身分、啟動程序與網路路徑。執行個體需要相容且運作中的 Agent、執行個體設定檔權限、Metadata 存取，以及對區域 SSM messaging endpoint 的對外連線。",
            "取消註冊 AMI 不會自動刪除 EBS Snapshot。刪除前要確認 Snapshot 沒有被其他保留中的 AMI 使用，清理後再查詢 AMI 與 Snapshot 狀態。"
        ],
        validation: [
            "自動化腳本有 Shell 語法與 help 輸出的檢查紀錄。",
            "新增服務的 AWS EC2 dry-run 回傳 Request would have succeeded，且沒有啟動執行個體。",
            "曾實際建立建置用 EC2，確認啟動階段可執行；後續 AMI 建立因附加加密磁碟的 KMS 存取錯誤而停止。這代表部分流程已執行，並非 AMI 發佈端到端完成。",
            "一次 AMI 與 Snapshot 清理作業完成後，AWS 查詢未再找到目標物件，取消註冊與刪除錯誤皆為零。"
        ],
        limitations: [
            "KMS 阻擋的 AMI 建立尚無成功重試紀錄；也未確認每個服務都完成 Auto Scaling 部署、目標群組健康檢查與復原演練。",
            "若來源執行個體位於多個子網路，現行腳本會警告後選第一個；仍應明確確認可用區、子網路容量與網路路徑，或改為讓操作人員指定。",
            "清理引用掃描涵蓋 EC2 執行個體、Launch Template Default／Latest 版本與 Launch Configuration；沒有紀錄能證明它檢查所有明確指定版本的 Launch Template 或外部帳號引用，因此刪除前仍需人工審查候選清單。",
            "SSM 啟動流程的變更通過 Shell 語法檢查，但沒有即時執行個體驗收紀錄。",
            "目前沒有部署時間、映像建置時間、成本或失敗率改善的量測結果。"
        ],
        portfolioValue: "展現 AWS 自動化、實用的 Shell 工程、部署流程標準化與雲端問題排查能力。"
    },
    "multi-country-gcp-architecture": {
        challenge: "現有 GCP 正式環境架構圖列出了主要服務，卻沒有清楚界定幾個營運邊界：交易是否可能同步依賴全域設定、哪些服務應使用公開或私有入口，以及各國的網路、資料與發布故障要如何隔離。同時，各區域測試環境的實際資源與 Terraform state 並不完全一致。這項工作要將邏輯服務圖整理成可供維運檢視的目標架構，並清楚區分建議的邊界與已實際部署的基礎設施。",
        architecture: [
            "將目前正式環境拓樸與多國目標架構分開呈現，標示既有、提議與模擬元件，避免圖面讓人誤以為尚未驗證的環境已經部署。",
            "讓全域控制平面負責身分、設定管理與發布、版本發布協調及共用分析。國家或租戶路由由 Edge 根據快取對應資料處理；POS、訂單與公開 API 的交易不應同步查詢全域設定 API 或資料庫。",
            "將每個國家規劃為獨立故障域，具備自己的專案、VPC、私有 GKE 叢集、區域資料庫、快取、儲存、密鑰及可觀測性邊界。這是目標隔離模型，不代表目前每個測試環境都已有獨立專案與 VPC。",
            "依信任層級與通訊協定拆分入口：Web、API 與 webhook 使用公開 L7；Console 與維運使用私有或受 IAP 保護的入口；POS 或裝置訊息使用專用 L4 路徑。",
            "以版本化設定包、CDC 或匯出／匯入快照非同步發布參照設定，讓各國服務讀取本地資料。FDW 與實體化檢視表的更新不應進入應用程式請求路徑；其跨區資料庫依賴應視為過渡期風險。",
            "透過各國與各環境的發布通道逐步推廣不可變產物，並一起追蹤應用程式映像、部署 manifest／基礎設施版本與設定版本，搭配各國的核准和回復流程。",
            "在目標拓樸標示多可用區部署、資料庫故障切換、回復與降級模式；RTO／RPO 和詳細復原行為則明確列為仍待驗證的項目。"
        ],
        diagramCaption: "目標架構：控制、流量與各國執行環境邊界",
        diagram: ["正式環境基準與共用依賴", "全域身分、設定與發布控制", "依快取國別對應資料進行 Edge 路由", "公開 L7 · 私有維運 · 專用裝置入口", "私有國別執行環境與區域資料服務", "非同步版本化設定與本地快照", "各國發布、可觀測性、回復與降級模式"],
        implementation: [
            "檢視 GCP 正式環境架構圖與相關設計文件，將目前狀態與提議的全域控制平面、各國執行平面分開整理。",
            "更新多國 draw.io 拓樸與配套說明，讓請求路徑、入口類型、區域資源責任、非同步設定發布、發布通道及降級模式都能被檢視。",
            "將 Terraform 結構整理為共用網路與區域範圍，並明確記錄 remote state 合約，讓區域 plan 或 apply 前能先檢查資源依賴與管理責任。",
            "以唯讀 GCP 資源盤點比對多個非正式環境的 Terraform state 與 plan；提出變更前，先分類哪些資源已納管、已存在但未納管、設定不完整或尚未建立。",
            "為一個選定的非正式區域環境套用並檢查基礎網路、身分、儲存／映像倉庫與運算資源；GKE 叢集也進入 RUNNING 狀態。",
            "區域進階入口與負載平衡器仍停留在 Terraform 宣告與 plan，沒有納入已驗證的 apply 範圍。",
            "在標準化檢視中保留各環境專屬的資源識別資訊與擁有者。若雲端實際資源與 Terraform 不同，先匯入或校正 state，再檢視精確的 plan，而不是為了名稱一致就替換資源。",
            "將既有 FDW 與實體化檢視表參照資料路徑記錄為背景同步機制，並指出仍存在跨區資料庫依賴；紀錄沒有證明此路徑已被完整運作的非同步發布服務取代。"
        ],
        operationalLessons: [
            "無狀態、多可用區的 API 層不代表整個全域控制平面沒有單點。全域資料庫、身分服務、路由／設定發布、DNS 與跨區連線都需要各自的復原設計。",
            "邏輯上的國家分組本身不是隔離邊界。應分別驗證專案與 VPC 擁有權、私有叢集存取、IAM、密鑰、資料服務、發布權限、監控與告警。",
            "全域到各國的設定發布不應成為交易流量的同步依賴。使用本地快照與快取路由，可以讓國家環境在控制平面不可用時，繼續使用最後一份有效設定。",
            "FDW 實體化檢視表可讓應用程式讀取本地資料，但更新仍依賴全域資料庫、資料庫憑證與跨區連線；這些依賴必須納入復原模型。",
            "所有 Terraform backend 完成初始化並協調既有資源前，Terraform state 還不是完整的雲端資源清單。對部分納管的環境 Apply 前，必須交叉比對 state、plan 與雲端 API。"
        ],
        validation: [
            "獨立的多國 draw.io 檔案及基礎設施主圖中的對應頁面，在目標架構更新後都通過結構檢查；另整理了元件與關係清單供檢視。",
            "有 Terraform 格式、驗證與部分區域 plan 的紀錄；其中一個非正式區域基礎環境完成 Apply 與檢查，GKE 叢集回報 RUNNING。",
            "比對雲端資源與 Terraform 後發現各區域就緒程度不一：有些基礎設施已存在、有些資源尚未納入已初始化的 Terraform state，另有部分入口或國別服務仍未 Apply。",
            "檢視結果確認，目標架構不能描述成正式環境已完成部署：沒有證據顯示已完成各國流量切換、所有環境收斂，或跨區域復原演練。"
        ],
        limitations: [
            "每國一個專案與 VPC 的故障域是目標設計；既有測試範圍仍有共用基礎設施，尚不能證明各國已完全隔離。",
            "非同步設定發布、入口分流、完整的各國發布通道與降級行為，仍屬架構邊界，尚未全面驗證為正式環境能力。",
            "設計文件仍保留 FDW 與實體化檢視表同步；沒有證據顯示已完成遷移至版本化非同步快照或其他解耦傳輸方式。",
            "進階入口 plan 尚未 Apply；紀錄也未證明所有國家專案與 Terraform backend 已收斂，或已完成多國正式環境流量切換。",
            "全域與各國的高可用及災難復原，仍需明確設計並驗證 SSO 與資料庫故障切換、備份／PITR、DNS 切換、RTO／RPO、國家級故障與降級演練。Canary 推廣、回復條件及各國可觀測性／稽核檢視也待端到端驗證。"
        ],
        portfolioValue: "展現基礎設施架構檢視與分階段 GCP 交付能力：切開控制平面與交易路徑、定義國別故障域與入口邊界、核對 Terraform 與實際資源，並清楚說明哪些仍是目標而非正式環境保證。"
    },
    "datastream-cdc-consistency": {
        challenge: "系統營運狀態與目的端檢查無法提供一致的同步完整性證據；來源端存取也仰賴身分與授權設定一致。調查必須區分控制平面的健康訊號，與資料結果是否確實驗證。",
        architecture: [
            "將來源端授權與 connection profile 使用的身分視為同一條權限路徑一併評估。",
            "比對串流狀態、回填進度與目的端實際觀測到的資料。",
            "將目的端資料完整性視為獨立於串流健康狀態的驗證訊號。"
        ],
        implementation: [
            "比對串流狀態、回填進度與目的端實際觀測到的資料。",
            "檢視來源端授權，以及 connection profile 設定所使用的身分。",
            "調查不同環境間的來源存取設定不一致，並將此問題與目的端資料完整性檢查分開處理。",
            "記錄為何串流健康狀態與回填狀態仍須透過資料層級的檢查獨立驗證。"
        ],
        validation: [
            "調查結果區分了控制平面狀態與目的端資料檢查，也將來源身分設定列為獨立的驗證項目。",
            "調查顯示，串流狀態與回填狀態本身不足以證明端到端資料完整。"
        ],
        limitations: [
            "目前沒有可重複執行的自動稽核紀錄。",
            "列數比對、資料新鮮度檢查、延遲監控、主體一致性檢查與歷史資料復原仍待後續驗證。"
        ],
        portfolioValue: "展現接近正式環境的問題調查、資料一致性判斷、CDC 疑難排解，以及以可靠性為核心的驗證設計。"
    },
    "vendor-environment-design": {
        challenge: "外部協作者需要存取程式碼儲存庫與服務，但若共用開發基礎設施的邊界不清楚，可能造成資料曝露、環境互相干擾，以及變更追蹤不足。",
        architecture: [
            "為每位外部開發者配置權限範圍獨立的執行環境與服務端點。",
            "以可重用的 DNS、TLS 與健康檢查設定管理端點。",
            "將儲存庫控管、雲端身分、網路政策與測試資料邊界納入分層存取模型。",
            "將日誌、監控、敏感資訊遮罩與稽核視為規劃中的營運控管，不宣稱這些功能已完整建置。"
        ],
        implementation: [
            "盤點 GitHub 儲存庫、CI/CD、DNS、服務端點、IAM 與 GCP 基礎設施。",
            "設計可重用的 Vendor Runtime Template 與外部開發者隔離環境模型。",
            "規劃儲存庫團隊或外部協作者權限、分支保護、必要檢查與部署邊界。",
            "設計 PostgreSQL、Redis 與 GCS 測試資料的限縮存取方式，以及日誌、監控、遮罩與稽核需求。",
            "實作部分 Terraform IAM 設定並執行靜態驗證。",
            "確認部分雲端存取變更仍停留在 Terraform 設定中，尚未套用至環境。"
        ],
        validation: [
            "GCP IAM 設定變更、Terraform 驗證與外部協作者存取調整都有實作紀錄。",
            "現有證據支持的是架構設計與部分 IAM 實作，並非完整的外部協作者平台上線。"
        ],
        limitations: [
            "尚未確認獨立執行環境、完整 CI/CD、UAT 與安全驗收均已完成。",
            "部分 Terraform 權限變更尚未套用。"
        ],
        portfolioValue: "展現開發者環境架構、最小權限規劃、外部協作治理與營運隔離設計。"
    },
    "cloud-observability-alerting": {
        challenge: "可靠維運仰賴故障偵測、告警傳遞與有用日誌的保留。這些流程橫跨多個系統，因此必須明確設計並驗證可用性、密鑰處理與失敗行為。",
        architecture: [
            "降低維護期間監控元件中斷的風險。",
            "從 AWS Secrets Manager 讀取通知密鑰，避免將 token 寫入原始碼。",
            "針對傳送日誌至 S3 的流程，明確定義來源路徑、排程、失敗紀錄與關機時的緩衝資料寫入。"
        ],
        implementation: [
            "調整 Alertmanager 副本數與 PodDisruptionBudget，並解析 Kubernetes YAML 確認結構有效。",
            "透過 AWS CDK 整合特定 EC2／資料庫停止告警與 Lambda 通知設定。",
            "評估聊天工具通知管道，並建議從受管理的密鑰儲存服務讀取憑證。",
            "檢視 EC2／VM 日誌傳送至 S3 的設計，包括日誌路徑、S3 key 分區、排程與錯誤紀錄。",
            "找出固定服務路徑、缺少排程工作輸出、關機時未寫入緩衝資料，以及 cron 重疊等風險。",
            "提出依環境設定日誌路徑、明確記錄執行結果，並以 systemd timer 作為後續方案。"
        ],
        validation: [
            "部分 Alertmanager 設定變更有結構驗證紀錄。",
            "AWS 告警整合已通過編譯，但尚未確認通知端到端成功送達。",
            "S3 日誌傳送仍屬設計與風險檢視，沒有正式環境部署的證據。"
        ],
        limitations: [
            "告警送達率、監控涵蓋範圍、日誌傳輸失敗處理、S3 生命週期政策，以及元件故障時的監控可用性都需要進一步驗證。"
        ],
        portfolioValue: "展現可觀測性設計、營運風險分析、告警設定與可靠性工程實務。"
    },
    "mqtt-wss-architecture-assessment": {
        challenge: "瀏覽器用戶端無法直接使用原始 TCP socket 傳送 MQTT，因此瀏覽器連線必須透過安全 WebSocket 傳輸 MQTT。現有 EMQX 部署也需要重新檢視託管方式，並納入持久化與營運責任。",
        architecture: [
            "定義瀏覽器至 EMQX 的 WSS 路徑，並涵蓋 TLS、驗證與 topic ACL。",
            "明確規劃 client ID、keepalive、重新連線、訂閱與後端發佈驗證行為。",
            "依持久化、備份、更新、網路、監控與維護責任，比較 GKE Autopilot 與 VM 託管方式。",
            "將應用程式 startup probe 問題與託管方案評估分開分析。"
        ],
        implementation: [
            "盤點各環境使用的 EMQX 映像版本。",
            "設計 WSS listener 與瀏覽器用戶端需求，包括 TLS 憑證及 topic 存取控制。",
            "評估將 EMQX 從 GKE Autopilot 遷移至 VM 所需的工作。",
            "調查 Kubernetes liveness probe 過早重啟應用程式、導致初始化尚未完成的問題。",
            "追查重啟原因為身分探索依賴逾時，並將其與 MQTT 託管方式評估分開處理。"
        ],
        validation: [
            "EMQX 版本、連線需求與部分 Kubernetes 啟動問題都有調查紀錄。",
            "現有證據支持 WSS 設計與遷移評估，尚不能證明 WSS 已部署完成或 VM 遷移已完成。"
        ],
        limitations: [
            "WSS 連線、憑證輪替、用戶端驗證，以及後端至瀏覽器的完整訊息路徑仍待驗證。",
            "託管方案尚未定案；選擇時應一併考量可用性、成本、持久化與維護責任。"
        ],
        portfolioValue: "展現訊息系統架構、通訊協定理解、Kubernetes 疑難排解與基礎設施方案取捨分析。"
    },
    "fluxseer-rca": {
        challenge: "事件調查常以聊天訊息、螢幕截圖或指令歷程作結，難以確認結論依據了哪些證據、哪些主張已驗證、資料來源是否降級，或哪些資訊被送往外部模型。FluxSeer 將調查本身建構為 Kubernetes 中受控且可檢視的工作流程。",
        architecture: [
            "以 InvestigationRequest 表示每次調查，作為操作人員問題或外部整合請求的持久化入口。",
            "從 Kubernetes Events 與工作負載狀態收集範圍受限的證據；也可透過宣告式 DataSource 整合加入 Prometheus 與 Loki。",
            "產生判定前先檢查證據是否充分；呼叫代管模型前先遮罩證據，並依證據參照驗證各項主張。",
            "將結構化結果、證據參照、缺少的證據、資料來源降級狀態與執行歷程儲存在 Kubernetes 資源狀態中。"
        ],
        diagramCaption: "唯讀事件調查流程",
        diagram: ["調查請求", "範圍受限的證據", "充分性檢查與遮罩", "推理與主張驗證", "可稽核的 RCA 狀態"],
        implementation: [
            "使用 Go、controller-runtime reconciler 與 Kubernetes CRD 建置控制平面，管理調查請求、資料來源及模型供應者。",
            "將證據收集、模型推理與主張驗證分開，確保模型回應不能略過證據檢查。",
            "預設使用本機 heuristic provider，且不需密鑰。使用代管的 OpenAI、Claude 與 Gemini provider，則必須明確設定並提供憑證。",
            "在結構化 RCA 狀態中加入精簡證據參照、替代假設、缺少證據與資料來源降級資訊、確定性識別值，以及 provider 執行稽核資料。",
            "內建 21 種偵測模式：預設可使用 6 種 Kubernetes 模式；8 種 Prometheus 與 7 種 Loki 模式則須設定對應資料來源並明確啟用。"
        ],
        validation: [
            "儲存庫記載目前發布版本為 v0.4.0-beta.3，並指出更廣泛的實際叢集驗證仍在進行。",
            "儲存庫驗證報告顯示：P0 執行情境 15／15、標準工作負載情境 2／2、請求速率突增案例 5／5，以及高錯誤率／高延遲模式案例 10／10 通過。這些是專案驗證結果，不代表正式服務的 SLA 或營運成效。",
            "預設 Helm 部署路徑採唯讀模式，並使用不需外部模型憑證的 heuristic provider。代管模型 provider 與變更權限都必須選擇性啟用。"
        ],
        limitations: [
            "專案目前仍處於 Beta；更廣泛的實際叢集涵蓋，以及 adapter 驗證、重試與退避機制的正式環境強化工作仍未完成。",
            "Prometheus 與 Loki 規則模式需要對應整合並明確啟用；預設不會啟用全部 21 種模式。",
            "受控修復仍屬實驗功能。目前開發範圍僅允許經核准及政策控管的 Deployment rollout restart，並使用獨立的實驗性執行器權限；GitOps pull request 執行器仍在規劃中。",
            "本專案不提供通用 Shell 或叢集代理程式，也不宣稱 RCA 判定必然找到已確認的根因或修復工作負載。"
        ],
        portfolioValue: "此專案整合 Kubernetes API 設計、證據治理、模型供應者邊界、安全預設與驗證成熟度，形成一套完整的營運調查流程。"
    },
    autosel: {
        challenge: "容器工作負載會隨生命週期與設定持續變動，手動管理 SELinux 政策需要檢視容器設定、產生適用規則，並在變更時更新控管方式。AutoSEL 以碩士論文為背景，探討如何自動化這段政策管理流程。",
        architecture: [
            "監聽 Docker 容器事件，並在工作負載啟動或變更時檢查容器設定。",
            "解析容器設定，整理政策產生元件所需的輸入資料。",
            "產生並載入 SELinux 政策，再透過自訂 SELinux 標籤套用至容器。",
            "監聽到需要更新政策的事件時，重新產生政策並替換受影響的容器。"
        ],
        diagramCaption: "容器政策生命週期",
        diagram: ["Docker 事件", "檢查容器設定", "產生政策", "載入 SELinux 政策", "套用至容器"],
        implementation: [
            "將系統拆分為容器監控、設定解析、政策建立與政策套用元件。",
            "依 Docker 容器事件自動產生或重新載入政策。",
            "記錄套用產生政策與 SELinux 標籤時所使用的容器替換流程。",
            "展示對 privileged 容器、裝置與主機掛載，以及系統能力的政策控管。"
        ],
        validation: [
            "專案文件包含自動產生與重新載入政策的示範，也展示對 privileged 操作、掛載與系統能力的限制。",
            "這些是文件中記錄的專案示範；目前沒有宣稱已正式導入、大規模效能測試或營運影響量測。"
        ],
        limitations: [
            "套用重新產生的政策可能需要停止並替換容器，因此需評估工作負載中斷與資料處理方式。",
            "現有專案資料未提供大規模效能結果或正式環境部署驗證。"
        ],
        portfolioValue: "這篇碩士論文結合 Linux 安全、Docker 生命週期事件、SELinux 政策產生與容器控管，實作自動化政策流程。"
    }
};

export const localizeCaseStudy = (work, language) => {
    if (language !== "zh") return work;
    const translation = caseStudyTranslations[work.slug];
    if (!translation) return work;

    return {
        ...work,
        ...translation,
        sharedEnvironment: translation.sharedEnvironment || work.sharedEnvironment,
        dataTables: translation.dataTables || work.dataTables
    };
};
